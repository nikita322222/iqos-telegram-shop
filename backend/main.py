from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, String
from typing import List
import shutil
from pathlib import Path

import models
import schemas
from database import get_db, init_db
from auth import get_current_user
from config import settings

# Middleware для проверки прав админа
def get_current_admin(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Проверка что текущий пользователь - админ"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user or user.role != 'admin':
        raise HTTPException(status_code=403, detail="Доступ запрещен. Требуются права администратора.")
    
    return user

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


# === BONUS ENDPOINTS ===

def calculate_loyalty_level(orders_count: int) -> str:
    """Вычисление уровня лояльности"""
    if orders_count >= 16:
        return "gold"
    elif orders_count >= 6:
        return "silver"
    else:
        return "bronze"


def get_cashback_percent(loyalty_level: str) -> float:
    """Получение процента кэшбэка по уровню"""
    cashback_rates = {
        "bronze": 0.8,
        "silver": 1.5,
        "gold": 2.0
    }
    return cashback_rates.get(loyalty_level, 0.8)


@app.get("/api/bonus/info")
def get_bonus_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение информации о бонусах пользователя"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Вычисляем прогресс до следующего уровня
    current_orders = user.total_orders_count
    next_level_orders = 0
    progress_percent = 0
    
    if user.loyalty_level == "bronze":
        next_level_orders = 6
        progress_percent = min(100, (current_orders / 6) * 100)
    elif user.loyalty_level == "silver":
        next_level_orders = 16
        progress_percent = min(100, ((current_orders - 6) / 10) * 100)
    else:  # gold
        next_level_orders = current_orders
        progress_percent = 100
    
    return {
        "bonus_balance": user.bonus_balance,
        "loyalty_level": user.loyalty_level,
        "total_orders_count": user.total_orders_count,
        "cashback_percent": get_cashback_percent(user.loyalty_level),
        "next_level_orders": next_level_orders,
        "progress_percent": progress_percent
    }


@app.get("/api/bonus/transactions")
def get_bonus_transactions(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """Получение истории бонусных транзакций"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    transactions = db.query(models.BonusTransaction).filter(
        models.BonusTransaction.user_id == user.id
    ).order_by(models.BonusTransaction.created_at.desc()).limit(limit).all()
    
    return transactions


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
    search: str = None,
    sort_by: str = None,  # "price_asc" или "price_desc"
    min_price: float = None,
    max_price: float = None,
    in_stock: bool = None,  # True = только в наличии
    badge: str = None,  # "NEW", "ХИТ", "СКИДКА"
    db: Session = Depends(get_db)
):
    """Получение списка товаров с поиском, сортировкой и фильтрами"""
    query = db.query(models.Product).filter(models.Product.is_active == True)
    
    if category:
        query = query.filter(models.Product.category == category)
    
    if search:
        # Поиск по названию (регистронезависимый)
        search_pattern = f"%{search}%"
        query = query.filter(models.Product.name.ilike(search_pattern))
    
    # Фильтр по цене
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    
    # Фильтр по наличию
    if in_stock is True:
        query = query.filter(models.Product.stock > 0)
    
    # Фильтр по бейджу (NEW, ХИТ, СКИДКА)
    if badge:
        query = query.filter(models.Product.badge == badge)
    
    # Сортировка
    if sort_by == "price_asc":
        query = query.order_by(models.Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(models.Product.price.desc())
    else:
        # По умолчанию сортируем по ID
        query = query.order_by(models.Product.id)
    
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
        
        # КРИТИЧНО: Проверка остатков
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Недостаточно товара '{product.name}'. В наличии: {product.stock} шт."
            )
        
        item_total = product.price * item.quantity
        total_amount += item_total
        
        order_items.append({
            'product': product,
            'product_id': product.id,
            'quantity': item.quantity,
            'price': product.price
        })
    
    # КРИТИЧНО: Минимальная сумма заказа
    MIN_ORDER_AMOUNT = 10.0  # 10 BYN минимум
    if total_amount < MIN_ORDER_AMOUNT:
        raise HTTPException(
            status_code=400, 
            detail=f"Минимальная сумма заказа: {MIN_ORDER_AMOUNT} BYN"
        )
    
    # Обработка бонусов
    bonus_to_use = order_data.bonus_to_use or 0.0
    max_bonus_allowed = total_amount * 0.2  # Максимум 20% от суммы заказа
    
    if bonus_to_use > 0:
        if bonus_to_use > user.bonus_balance:
            raise HTTPException(status_code=400, detail="Недостаточно бонусов")
        if bonus_to_use > max_bonus_allowed:
            raise HTTPException(status_code=400, detail=f"Можно использовать максимум 20% от суммы заказа ({max_bonus_allowed:.2f} BYN)")
        if bonus_to_use > total_amount:
            raise HTTPException(status_code=400, detail="Бонусов больше чем сумма заказа")
    
    # Расчет стоимости доставки
    delivery_cost = 0.0
    if order_data.delivery_type == 'minsk':
        # Доставка по Минску: бесплатно от 300 BYN, иначе 8 BYN
        if total_amount < 300:
            delivery_cost = 8.0
    elif order_data.delivery_type == 'europost':
        # Евро почта: всегда 8 BYN
        delivery_cost = 8.0
    
    # Применяем бонусы к сумме заказа (без учета доставки)
    final_amount = total_amount - bonus_to_use + delivery_cost
    
    try:
        # Создаем заказ
        db_order = models.Order(
            user_id=user.id,
            total_amount=final_amount,
            delivery_cost=delivery_cost,
            bonus_used=bonus_to_use,
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
        
        # Добавляем товары в заказ (БЕЗ уменьшения остатков)
        for item_data in order_items:
            order_item = models.OrderItem(
                order_id=db_order.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            db.add(order_item)
            
            # Остатки НЕ уменьшаем - товары всегда в наличии
        
        # Списываем бонусы если использованы
        if bonus_to_use > 0:
            user.bonus_balance -= bonus_to_use
            
            # Создаем транзакцию списания
            bonus_transaction = models.BonusTransaction(
                user_id=user.id,
                amount=-bonus_to_use,
                transaction_type="spent",
                description=f"Оплата заказа #{db_order.id}",
                order_id=db_order.id
            )
            db.add(bonus_transaction)
        
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
                'delivery_cost': float(db_order.delivery_cost),
                'bonus_used': float(db_order.bonus_used),
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
async def update_order_status(
    order_id: int,
    status_data: dict,
    db: Session = Depends(get_db)
):
    """Обновление статуса заказа с уведомлением клиента"""
    import httpx
    
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    old_status = order.status
    new_status = status_data.get('status')
    if new_status not in ['pending', 'confirmed', 'completed', 'cancelled']:
        raise HTTPException(status_code=400, detail="Неверный статус")
    
    order.status = new_status
    
    # НЕ возвращаем товары на склад при отмене - остатки не меняются
    # Только возвращаем бонусы если они были использованы
    if new_status == 'cancelled' and old_status != 'cancelled':
        if order.bonus_used > 0:
            user = order.user
            user.bonus_balance += order.bonus_used
            
            # Создаем транзакцию возврата
            bonus_transaction = models.BonusTransaction(
                user_id=user.id,
                amount=order.bonus_used,
                transaction_type="refund",
                description=f"Возврат бонусов за отмененный заказ #{order.id}",
                order_id=order.id
            )
            db.add(bonus_transaction)
    
    # Начисляем бонусы при подтверждении заказа
    if old_status == 'pending' and new_status == 'confirmed':
        user = order.user
        
        # Вычисляем процент кэшбэка
        cashback_percent = get_cashback_percent(user.loyalty_level)
        bonus_earned = round((order.total_amount + order.bonus_used) * cashback_percent / 100, 2)
        
        # Начисляем бонусы
        user.bonus_balance += bonus_earned
        user.total_orders_count += 1
        
        # Обновляем уровень лояльности
        new_level = calculate_loyalty_level(user.total_orders_count)
        if new_level != user.loyalty_level:
            user.loyalty_level = new_level
        
        # Сохраняем информацию о начисленных бонусах в заказе
        order.bonus_earned = bonus_earned
        
        # Создаем транзакцию начисления
        bonus_transaction = models.BonusTransaction(
            user_id=user.id,
            amount=bonus_earned,
            transaction_type="earned",
            description=f"Начислено за заказ #{order.id} ({cashback_percent}% кэшбэк)",
            order_id=order.id
        )
        db.add(bonus_transaction)
    
    db.commit()
    
    # Отправляем уведомление клиенту
    try:
        user = order.user
        bot_token = settings.bot_token
        
        if new_status == 'confirmed':
            message = (
                f"✅ <b>Ваш заказ #{order.id} подтвержден!</b>\n\n"
                f"💰 Сумма: {order.total_amount} BYN\n"
            )
            if order.bonus_earned > 0:
                message += f"🎁 Начислено бонусов: +{order.bonus_earned} BYN\n"
            
            if order.delivery_type == 'minsk':
                message += (
                    f"\n🚚 Доставка по адресу:\n{order.delivery_address}\n"
                    f"🕐 Время: {order.delivery_time}\n"
                )
                if order.delivery_date:
                    message += f"📅 Дата: {order.delivery_date}\n"
            else:
                message += (
                    f"\n📦 Отправка Евро почтой:\n"
                    f"🏙 {order.city}, отделение {order.europost_office}\n"
                )
            
            message += "\nСпасибо за заказ! 🎉"
            
        elif new_status == 'cancelled':
            message = (
                f"❌ <b>Ваш заказ #{order.id} отменен</b>\n\n"
                f"К сожалению, мы не смогли выполнить ваш заказ.\n"
            )
            if order.bonus_used > 0:
                message += f"💰 Бонусы возвращены: +{order.bonus_used} BYN\n"
            message += f"\nЕсли у вас есть вопросы, обратитесь к менеджеру @Heets_manager"
        else:
            message = None
        
        if message:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"https://api.telegram.org/bot{bot_token}/sendMessage",
                    json={
                        "chat_id": user.telegram_id,
                        "text": message,
                        "parse_mode": "HTML"
                    }
                )
    except Exception as e:
        print(f"Ошибка отправки уведомления клиенту: {e}")
    
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
        'delivery_cost': order.delivery_cost,
        'bonus_used': order.bonus_used,
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


# === SAVED ADDRESSES ENDPOINTS ===

@app.get("/api/saved-addresses", response_model=List[schemas.SavedAddress])
def get_saved_addresses(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение сохраненных адресов пользователя"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    addresses = db.query(models.SavedAddress).filter(
        models.SavedAddress.user_id == user.id
    ).order_by(models.SavedAddress.is_default.desc(), models.SavedAddress.created_at.desc()).all()
    
    return addresses


@app.post("/api/saved-addresses", response_model=schemas.SavedAddress)
def create_saved_address(
    address_data: schemas.SavedAddressCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создание нового сохраненного адреса"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Если это адрес по умолчанию, убираем флаг у других
    if address_data.is_default:
        db.query(models.SavedAddress).filter(
            models.SavedAddress.user_id == user.id
        ).update({"is_default": False})
    
    address = models.SavedAddress(
        user_id=user.id,
        **address_data.dict()
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    
    return address


@app.put("/api/saved-addresses/{address_id}", response_model=schemas.SavedAddress)
def update_saved_address(
    address_id: int,
    address_data: schemas.SavedAddressCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновление сохраненного адреса"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    address = db.query(models.SavedAddress).filter(
        models.SavedAddress.id == address_id,
        models.SavedAddress.user_id == user.id
    ).first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Адрес не найден")
    
    # Если это адрес по умолчанию, убираем флаг у других
    if address_data.is_default and not address.is_default:
        db.query(models.SavedAddress).filter(
            models.SavedAddress.user_id == user.id,
            models.SavedAddress.id != address_id
        ).update({"is_default": False})
    
    for key, value in address_data.dict().items():
        setattr(address, key, value)
    
    db.commit()
    db.refresh(address)
    
    return address


@app.delete("/api/saved-addresses/{address_id}")
def delete_saved_address(
    address_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление сохраненного адреса"""
    user = db.query(models.User).filter(
        models.User.telegram_id == current_user['telegram_id']
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    address = db.query(models.SavedAddress).filter(
        models.SavedAddress.id == address_id,
        models.SavedAddress.user_id == user.id
    ).first()
    
    if not address:
        raise HTTPException(status_code=404, detail="Адрес не найден")
    
    db.delete(address)
    db.commit()
    
    return {"message": "Адрес удален"}


# === ADMIN ENDPOINTS ===

@app.get("/api/admin/dashboard")
def get_admin_dashboard(
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Статистика для админ панели"""
    from datetime import datetime, timedelta
    
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Заказы за сегодня
    today_orders = db.query(models.Order).filter(
        func.date(models.Order.created_at) == today
    ).all()
    
    # Заказы за неделю
    week_orders = db.query(models.Order).filter(
        func.date(models.Order.created_at) >= week_ago
    ).all()
    
    # Заказы за месяц
    month_orders = db.query(models.Order).filter(
        func.date(models.Order.created_at) >= month_ago
    ).all()
    
    # Ожидающие заказы
    pending_orders = db.query(models.Order).filter(
        models.Order.status == 'pending'
    ).count()
    
    # Новые пользователи
    new_users_week = db.query(models.User).filter(
        func.date(models.User.created_at) >= week_ago
    ).count()
    
    # Топ товары
    from sqlalchemy import desc
    top_products = db.query(
        models.OrderItem.product_id,
        func.sum(models.OrderItem.quantity).label('total_sold')
    ).group_by(models.OrderItem.product_id).order_by(desc('total_sold')).limit(5).all()
    
    return {
        "today": {
            "orders_count": len(today_orders),
            "revenue": sum(order.total_amount for order in today_orders)
        },
        "week": {
            "orders_count": len(week_orders),
            "revenue": sum(order.total_amount for order in week_orders)
        },
        "month": {
            "orders_count": len(month_orders),
            "revenue": sum(order.total_amount for order in month_orders)
        },
        "pending_orders": pending_orders,
        "new_users_week": new_users_week,
        "top_products": [{"product_id": p[0], "sold": p[1]} for p in top_products]
    }


# Products Management
@app.get("/api/admin/products")
def get_admin_products(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    search: str = None,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получение всех товаров для админа"""
    query = db.query(models.Product)
    
    if category:
        query = query.filter(models.Product.category == category)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(models.Product.name.ilike(search_pattern))
    
    products = query.order_by(models.Product.id.desc()).offset(skip).limit(limit).all()
    return products


@app.post("/api/admin/products")
def create_product(
    product_data: schemas.ProductCreate,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Создание нового товара"""
    product = models.Product(**product_data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.put("/api/admin/products/{product_id}")
def update_product(
    product_id: int,
    product_data: schemas.ProductCreate,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновление товара"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    for key, value in product_data.dict().items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return product


@app.delete("/api/admin/products/{product_id}")
def delete_product(
    product_id: int,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удаление товара"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    
    db.delete(product)
    db.commit()
    return {"message": "Товар удален"}


# Categories Management
@app.get("/api/admin/categories")
def get_categories(
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получение всех категорий"""
    categories = db.query(models.Category).order_by(models.Category.sort_order).all()
    return categories


@app.post("/api/admin/categories")
def create_category(
    category_data: dict,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Создание новой категории"""
    category = models.Category(**category_data)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@app.put("/api/admin/categories/{category_id}")
def update_category(
    category_id: int,
    category_data: dict,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Обновление категории"""
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    
    for key, value in category_data.items():
        setattr(category, key, value)
    
    db.commit()
    db.refresh(category)
    return category


@app.delete("/api/admin/categories/{category_id}")
def delete_category(
    category_id: int,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Удаление категории"""
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    
    db.delete(category)
    db.commit()
    return {"message": "Категория удалена"}


# Customers Management
@app.get("/api/admin/customers")
def get_customers(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получение списка клиентов"""
    query = db.query(models.User)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.User.username.ilike(search_pattern)) |
            (models.User.first_name.ilike(search_pattern)) |
            (models.User.last_name.ilike(search_pattern))
        )
    
    customers = query.order_by(models.User.created_at.desc()).offset(skip).limit(limit).all()
    return customers


# Orders Management
@app.get("/api/admin/orders")
def get_admin_orders(
    status: str = None,
    delivery_type: str = None,
    search: str = None,
    skip: int = 0,
    limit: int = 50,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получение всех заказов для админа"""
    query = db.query(models.Order)
    
    if status:
        query = query.filter(models.Order.status == status)
    
    if delivery_type:
        query = query.filter(models.Order.delivery_type == delivery_type)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Order.id.cast(String).like(search_pattern)) |
            (models.Order.full_name.ilike(search_pattern)) |
            (models.Order.phone.like(search_pattern))
        )
    
    orders = query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders


# Image Upload
from fastapi import UploadFile, File
import shutil
from pathlib import Path

@app.post("/api/admin/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    admin: models.User = Depends(get_current_admin)
):
    """Загрузка изображения товара"""
    # Создаем папку для изображений если её нет
    upload_dir = Path("uploads/products")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Генерируем уникальное имя файла
    import uuid
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Сохраняем файл
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Возвращаем URL изображения
    image_url = f"/uploads/products/{unique_filename}"
    return {"image_url": image_url}


# Serve uploaded images
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


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
