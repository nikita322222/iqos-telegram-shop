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
    try:
        init_db()
        print("✅ База данных инициализирована")
        
        # Проверяем количество товаров
        from database import SessionLocal
        import models
        
        db = SessionLocal()
        try:
            product_count = db.query(models.Product).count()
            user_count = db.query(models.User).count()
            print(f"📦 Товаров в базе: {product_count}")
            print(f"👥 Пользователей в базе: {user_count}")
        finally:
            db.close()
    except Exception as e:
        print(f"⚠️ Ошибка при инициализации: {e}")
        # Не падаем, продолжаем работу


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


@app.post("/api/users/update-info")
def update_user_info(
    user_data: dict,
    db: Session = Depends(get_db)
):
    """Обновление информации о пользователе из Telegram"""
    telegram_id = user_data.get('telegram_id')
    
    if not telegram_id:
        raise HTTPException(status_code=400, detail="telegram_id обязателен")
    
    user = db.query(models.User).filter(
        models.User.telegram_id == telegram_id
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Обновляем данные
    if 'username' in user_data and user_data['username']:
        user.username = user_data['username']
    if 'first_name' in user_data and user_data['first_name']:
        user.first_name = user_data['first_name']
    if 'last_name' in user_data and user_data['last_name']:
        user.last_name = user_data['last_name']
    
    db.commit()
    db.refresh(user)
    
    return {"message": "Данные пользователя обновлены", "user_id": user.id}


# === PRODUCT ENDPOINTS ===

@app.get("/api/products/debug", response_model=List[schemas.Product])
def get_products_debug(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    db: Session = Depends(get_db)
):
    """Получение списка товаров БЕЗ авторизации (для отладки)"""
    query = db.query(models.Product).filter(models.Product.is_active == True)
    
    if category:
        query = query.filter(models.Product.category == category)
    
    products = query.offset(skip).limit(limit).all()
    return products


@app.get("/api/products", response_model=List[schemas.Product])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    db: Session = Depends(get_db)
):
    """Получение списка товаров (авторизация опциональна)"""
    query = db.query(models.Product).filter(models.Product.is_active == True)
    
    if category:
        query = query.filter(models.Product.category == category)
    
    products = query.offset(skip).limit(limit).all()
    return products


@app.get("/api/products/{product_id}", response_model=schemas.Product)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Получение товара по ID (авторизация опциональна)"""
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
        
        # Сохраняем данные пользователя для автозаполнения
        user.saved_full_name = order_data.full_name
        user.saved_phone = order_data.phone
        user.saved_delivery_type = order_data.delivery_type
        
        if order_data.delivery_type == 'minsk':
            user.saved_delivery_address = order_data.delivery_address
        elif order_data.delivery_type == 'europost':
            user.saved_city = order_data.city
            user.saved_europost_office = order_data.europost_office
        
        db.commit()
        db.refresh(db_order)
        
        # Отправляем уведомление в Telegram группу
        try:
            import requests
            import os
            
            # Получаем товары заказа
            items = []
            for order_item in db_order.items:
                items.append({
                    'name': order_item.product.name,
                    'quantity': order_item.quantity,
                    'price': order_item.price
                })
            
            # Формируем данные для отправки
            notification_data = {
                'order_id': db_order.id,
                'full_name': db_order.full_name,
                'phone': db_order.phone,
                'total_amount': float(db_order.total_amount),
                'payment_method': db_order.payment_method,
                'delivery_type': db_order.delivery_type,
                'delivery_address': db_order.delivery_address,
                'delivery_time': db_order.delivery_time,
                'delivery_date': db_order.delivery_date,
                'city': db_order.city,
                'europost_office': db_order.europost_office,
                'comment': db_order.comment,
                'items': items
            }
            
            # Отправляем webhook на бота (локально или на сервере)
            bot_webhook_url = os.getenv('BOT_WEBHOOK_URL', 'http://localhost:8001/webhook/order')
            
            print(f"📤 Отправка уведомления о заказе #{db_order.id} на {bot_webhook_url}")
            response = requests.post(bot_webhook_url, json=notification_data, timeout=5.0)
            
            if response.status_code == 200:
                print(f"✅ Уведомление о заказе #{db_order.id} отправлено")
            else:
                print(f"⚠️ Ошибка отправки уведомления: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️ Ошибка отправки уведомления: {e}")
            # Не падаем, заказ уже создан
        
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


@app.get("/api/admin/orders/pending", response_model=List[schemas.Order])
def get_pending_orders(db: Session = Depends(get_db)):
    """Получение заказов со статусом pending для админа"""
    orders = db.query(models.Order).filter(
        models.Order.status == 'pending'
    ).order_by(models.Order.created_at.desc()).all()
    
    return orders


@app.patch("/api/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_data: dict,
    db: Session = Depends(get_db)
):
    """Обновление статуса заказа"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    new_status = status_data.get('status')
    if new_status not in ['pending', 'confirmed', 'completed', 'cancelled']:
        raise HTTPException(status_code=400, detail="Неверный статус")
    
    order.status = new_status
    db.commit()
    
    return {"message": "Статус обновлен", "order_id": order_id, "status": new_status}


@app.post("/api/orders/{order_id}/notify")
async def send_order_notification(order_id: int, db: Session = Depends(get_db)):
    """Отправка уведомления о заказе в Telegram группу"""
    import httpx
    import os
    
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    # Получаем товары заказа
    items = []
    for order_item in order.items:
        items.append({
            'name': order_item.product.name,
            'quantity': order_item.quantity,
            'price': order_item.price
        })
    
    # Формируем данные для отправки
    notification_data = {
        'order_id': order.id,
        'full_name': order.full_name,
        'phone': order.phone,
        'total_amount': order.total_amount,
        'payment_method': order.payment_method,
        'delivery_type': order.delivery_type,
        'delivery_address': order.delivery_address,
        'delivery_time': order.delivery_time,
        'delivery_date': order.delivery_date,
        'city': order.city,
        'europost_office': order.europost_office,
        'comment': order.comment,
        'items': items
    }
    
    # Отправляем webhook на бота
    bot_webhook_url = os.getenv('BOT_WEBHOOK_URL', 'http://localhost:8001/webhook/order')
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(bot_webhook_url, json=notification_data, timeout=10.0)
            if response.status_code == 200:
                return {"message": "Уведомление отправлено"}
            else:
                raise HTTPException(status_code=500, detail="Ошибка отправки уведомления")
    except Exception as e:
        print(f"Ошибка отправки уведомления: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка: {str(e)}")


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
