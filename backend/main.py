from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
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
    # Находим пользователя
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Вычисляем общую сумму
    total_amount = 0
    order_items = []
    
    for item in order_data.items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id,
            models.Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(status_code=404, detail=f"Товар {item.product_id} не найден")
        
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Недостаточно товара {product.name}")
        
        item_total = product.price * item.quantity
        total_amount += item_total
        
        order_items.append({
            'product_id': product.id,
            'quantity': item.quantity,
            'price': product.price
        })
    
    # Создаем заказ
    db_order = models.Order(
        user_id=user.id,
        total_amount=total_amount,
        delivery_address=order_data.delivery_address,
        phone=order_data.phone,
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


@app.get("/")
def root():
    return {"message": "IQOS Shop API"}
