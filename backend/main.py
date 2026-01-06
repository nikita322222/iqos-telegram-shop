from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

import models
import schemas
from database import get_db, init_db
from auth import get_current_user
from config import settings

app = FastAPI(title="IQOS Shop API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Инициализация БД при старте"""
    init_db()
    
    # Автоматически создаем тестовые данные если БД пустая
    from database import SessionLocal
    import models
    
    db = SessionLocal()
    try:
        # Проверяем есть ли пользователи
        user_count = db.query(models.User).count()
        if user_count == 0:
            # Создаем тестового пользователя
            user = models.User(
                telegram_id=576978144,
                username="nikita_user",
                first_name="Nikita",
                last_name="Morozov",
                is_active=True
            )
            db.add(user)
            db.commit()
            print("✅ Тестовый пользователь создан")
        
        # Проверяем есть ли товары
        product_count = db.query(models.Product).count()
        print(f"📦 Товаров в базе: {product_count}")
        
    finally:
        db.close()


# === USER ENDPOINTS ===

@app.get("/api/users/check/{telegram_id}")
def check_user_access(telegram_id: int, db: Session = Depends(get_db)):
    """Проверка доступа пользователя"""
    user = db.query(models.User).filter(
        models.User.telegram_id == telegram_id,
        models.User.is_active == True
    ).first()
    return {"has_access": user is not None}


@app.get("/api/users/me", response_model=schemas.User)
def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение информации о текущем пользователе"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    return user


# === PRODUCT ENDPOINTS ===

@app.get("/api/products", response_model=List[schemas.Product])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Получение списка товаров"""
    query = db.query(models.Product).filter(models.Product.is_active == True)
    
    if category:
        query = query.filter(models.Product.category == category)
    
    products = query.offset(skip).limit(limit).all()
    return products


@app.get("/api/products/{product_id}", response_model=schemas.Product)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Получение товара по ID"""
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    return product


# === ORDER ENDPOINTS ===

@app.post("/api/orders", response_model=schemas.Order)
def create_order(
    order_data: schemas.OrderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создание заказа"""
    # Валидация данных доставки
    if order_data.delivery_type not in ['minsk', 'europost']:
        raise HTTPException(status_code=400, detail="Неверный тип доставки")
    
    if order_data.delivery_type == 'minsk' and not order_data.delivery_address:
        raise HTTPException(status_code=400, detail="Укажите адрес доставки для Минска")
    
    if order_data.delivery_type == 'europost':
        if not order_data.city:
            raise HTTPException(status_code=400, detail="Укажите город для Евро почты")
        if not order_data.europost_office:
            raise HTTPException(status_code=400, detail="Укажите отделение Евро почты")
    
    if order_data.payment_method not in ['cash', 'usdt']:
        raise HTTPException(status_code=400, detail="Неверный способ оплаты")
    
    # Находим пользователя
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Проверка корзины
    if not order_data.items or len(order_data.items) == 0:
        raise HTTPException(status_code=400, detail="Корзина пуста")
    
    # Вычисляем общую сумму
    total_amount = 0
    order_items = []
    
    for item in order_data.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id,
            models.Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(status_code=404, detail=f"Товар с ID {item.product_id} не найден")
        
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Недостаточно товара: {product.name}")
        
        item_total = product.price * item.quantity
        total_amount += item_total
        
        order_items.append({
            'product_id': product.id,
            'quantity': item.quantity,
            'price': product.price
        })
    
    try:
        # Создаем заказ
        db_order = models.Order(
            user_id=user.id,
            total_amount=total_amount,
            delivery_type=order_data.delivery_type,
            full_name=order_data.full_name,
            phone=order_data.phone,
            payment_method=order_data.payment_method,
            delivery_address=order_data.delivery_address,
            delivery_time=order_data.delivery_time,
            delivery_date=order_data.delivery_date,
            city=order_data.city,
            europost_office=order_data.europost_office,
            comment=order_data.comment
        )
        db.add(db_order)
        db.flush()
        
        # Добавляем товары в заказ
        for item_data in order_items:
            order_item = models.OrderItem(
                order_id=db_order.id,
                **item_data
            )
            db.add(order_item)
        
        db.commit()
        db.refresh(db_order)
        
        return db_order
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка создания заказа: {str(e)}")


@app.get("/api/orders", response_model=List[schemas.Order])
def get_user_orders(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение заказов пользователя"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    orders = db.query(models.Order).filter(
        models.Order.user_id == user.id
    ).order_by(models.Order.created_at.desc()).all()
    
    return orders


# === FAVORITE ENDPOINTS ===

@app.get("/api/favorites", response_model=List[schemas.Favorite])
def get_favorites(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение избранных товаров"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    favorites = db.query(models.Favorite).filter(
        models.Favorite.user_id == user.id
    ).all()
    
    return favorites


@app.post("/api/favorites")
def add_to_favorites(
    favorite_data: schemas.FavoriteCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Добавление товара в избранное"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Проверяем, не добавлен ли уже
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == user.id,
        models.Favorite.product_id == favorite_data.product_id
    ).first()
    
    if existing:
        return {"message": "Товар уже в избранном"}
    
    favorite = models.Favorite(
        user_id=user.id,
        product_id=favorite_data.product_id
    )
    db.add(favorite)
    db.commit()
    
    return {"message": "Товар добавлен в избранное"}


@app.delete("/api/favorites/{product_id}")
def remove_from_favorites(
    product_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление товара из избранного"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == user.id,
        models.Favorite.product_id == product_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Товар не найден в избранном")
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Товар удален из избранного"}


@app.post("/api/admin/import-products")
def import_products_bulk(products: List[schemas.ProductCreate], db: Session = Depends(get_db)):
    """Массовый импорт товаров"""
    imported = 0
    updated = 0
    
    for product_data in products:
        existing = db.query(models.Product).filter(
            models.Product.name == product_data.name
        ).first()
        
        if existing:
            for key, value in product_data.dict().items():
                setattr(existing, key, value)
            updated += 1
        else:
            product = models.Product(**product_data.dict())
            db.add(product)
            imported += 1
    
    db.commit()
    
    return {
        "imported": imported,
        "updated": updated,
        "total": imported + updated
    }


@app.get("/")
def root():
    return {"message": "IQOS Shop API"}


@app.get("/api/admin/stats")
def get_stats(db: Session = Depends(get_db)):
    """Статистика для проверки"""
    users_count = db.query(models.User).count()
    products_count = db.query(models.Product).count()
    orders_count = db.query(models.Order).count()
    
    # Товары по категориям
    categories = db.query(
        models.Product.category,
        func.count(models.Product.id)
    ).group_by(models.Product.category).all()
    
    return {
        "users": users_count,
        "products": products_count,
        "orders": orders_count,
        "categories": [{"name": cat, "count": count} for cat, count in categories]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
