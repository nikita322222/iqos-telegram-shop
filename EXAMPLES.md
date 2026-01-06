# 📝 Примеры использования

## Примеры API запросов

### Получение списка товаров

```bash
curl -X GET "http://localhost:8000/api/products" \
  -H "Authorization: tma query_id=AAH..."
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "IQOS ILUMA PRIME",
    "description": "Премиальное устройство",
    "price": 12990,
    "image_url": "https://...",
    "category": "Устройства",
    "badge": "ХИТ",
    "is_active": true,
    "stock": 10,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Создание заказа

```bash
curl -X POST "http://localhost:8000/api/orders" \
  -H "Authorization: tma query_id=AAH..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"product_id": 1, "quantity": 2},
      {"product_id": 3, "quantity": 1}
    ],
    "phone": "+375291234567",
    "delivery_address": "г. Минск, ул. Ленина, д. 1",
    "comment": "Доставка после 18:00"
  }'
```

### Добавление в избранное

```bash
curl -X POST "http://localhost:8000/api/favorites" \
  -H "Authorization: tma query_id=AAH..." \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1}'
```

## Примеры кода Frontend

### Получение товаров с фильтрацией

```javascript
import { api } from './api/client'

// Все товары
const products = await api.getProducts()

// Товары по категории
const devices = await api.getProducts({ category: 'Устройства' })

// С пагинацией
const page2 = await api.getProducts({ skip: 20, limit: 20 })
```

### Работа с корзиной

```javascript
import { useCart } from './context/CartContext'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  
  const handleAddToCart = () => {
    addToCart(product, 1)
    
    // Haptic feedback
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
    }
  }
  
  return (
    <button onClick={handleAddToCart}>
      В корзину
    </button>
  )
}
```

### Оформление заказа

```javascript
import { api } from './api/client'
import { useCart } from './context/CartContext'

function CheckoutForm() {
  const { cart, clearCart } = useCart()
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    comment: ''
  })
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        phone: formData.phone,
        delivery_address: formData.address,
        comment: formData.comment
      }
      
      await api.createOrder(orderData)
      clearCart()
      
      // Показываем уведомление
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Заказ успешно оформлен!')
      }
    } catch (error) {
      console.error('Ошибка:', error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* форма */}
    </form>
  )
}
```

### Работа с избранным

```javascript
import { useState, useEffect } from 'react'
import { api } from './api/client'

function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  
  useEffect(() => {
    loadFavorites()
  }, [])
  
  const loadFavorites = async () => {
    const response = await api.getFavorites()
    setFavorites(response.data)
  }
  
  const toggleFavorite = async (productId) => {
    const isFavorite = favorites.some(f => f.product_id === productId)
    
    if (isFavorite) {
      await api.removeFromFavorites(productId)
    } else {
      await api.addToFavorites(productId)
    }
    
    loadFavorites()
  }
  
  return (
    <div>
      {favorites.map(fav => (
        <ProductCard
          key={fav.id}
          product={fav.product}
          onFavoriteToggle={toggleFavorite}
          isFavorite={true}
        />
      ))}
    </div>
  )
}
```

## Примеры кода Backend

### Добавление нового endpoint

```python
# backend/main.py

@app.get("/api/products/search")
def search_products(
    q: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Поиск товаров по названию"""
    products = db.query(models.Product).filter(
        models.Product.name.ilike(f"%{q}%"),
        models.Product.is_active == True
    ).all()
    return products
```

### Добавление нового поля в модель

```python
# backend/models.py

class Product(Base):
    __tablename__ = "products"
    
    # ... существующие поля ...
    
    # Новое поле
    discount_percent = Column(Integer, default=0)
    
    @property
    def discounted_price(self):
        if self.discount_percent > 0:
            return self.price * (1 - self.discount_percent / 100)
        return self.price
```

### Добавление валидации

```python
# backend/schemas.py

from pydantic import BaseModel, validator

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    
    @validator('items')
    def validate_items(cls, v):
        if not v:
            raise ValueError('Заказ должен содержать хотя бы один товар')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if not v or len(v) < 10:
            raise ValueError('Некорректный номер телефона')
        return v
```

## Примеры кода Bot

### Отправка уведомления с кнопками

```python
# bot/main.py

from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

async def notify_admin_with_actions(order_data: dict):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="✅ Подтвердить",
                callback_data=f"confirm_order_{order_data['order_id']}"
            ),
            InlineKeyboardButton(
                text="❌ Отменить",
                callback_data=f"cancel_order_{order_data['order_id']}"
            )
        ]
    ])
    
    message_text = (
        f"🔔 <b>Новый заказ #{order_data['order_id']}</b>\n\n"
        f"👤 {order_data['username']}\n"
        f"💰 {order_data['total_amount']} руб.\n"
        f"📦 {order_data['items_count']} товаров"
    )
    
    await bot.send_message(
        chat_id=config.ADMIN_TELEGRAM_ID,
        text=message_text,
        reply_markup=keyboard,
        parse_mode="HTML"
    )
```

### Обработка callback от кнопок

```python
from aiogram import F
from aiogram.types import CallbackQuery

@dp.callback_query(F.data.startswith("confirm_order_"))
async def confirm_order(callback: CallbackQuery):
    order_id = callback.data.split("_")[-1]
    
    # Обновляем статус заказа через API
    async with aiohttp.ClientSession() as session:
        await session.patch(
            f"{config.BACKEND_URL}/api/orders/{order_id}",
            json={"status": "confirmed"}
        )
    
    await callback.answer("Заказ подтвержден!")
    await callback.message.edit_text(
        f"{callback.message.text}\n\n✅ Заказ подтвержден"
    )
```

### Команда для администратора

```python
from aiogram.filters import Command

@dp.message(Command("stats"))
async def show_stats(message: Message):
    # Проверяем, что это администратор
    if message.from_user.id != int(config.ADMIN_TELEGRAM_ID):
        return
    
    # Получаем статистику через API
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{config.BACKEND_URL}/api/admin/stats"
        ) as response:
            stats = await response.json()
    
    text = (
        f"📊 <b>Статистика</b>\n\n"
        f"👥 Пользователей: {stats['users_count']}\n"
        f"📦 Товаров: {stats['products_count']}\n"
        f"🛒 Заказов: {stats['orders_count']}\n"
        f"💰 Выручка: {stats['total_revenue']} руб."
    )
    
    await message.answer(text, parse_mode="HTML")
```

## Примеры работы с базой данных

### Добавление пользователя

```python
from backend.database import SessionLocal
from backend.models import User

db = SessionLocal()

user = User(
    telegram_id=123456789,
    username="new_user",
    first_name="Иван",
    last_name="Иванов",
    is_active=True
)

db.add(user)
db.commit()
db.refresh(user)

print(f"Создан пользователь с ID: {user.id}")
```

### Добавление товара

```python
from backend.models import Product

product = Product(
    name="IQOS ILUMA ONE",
    description="Компактное устройство",
    price=5990,
    category="Устройства",
    badge="NEW",
    stock=20,
    image_url="https://example.com/image.jpg"
)

db.add(product)
db.commit()
```

### Получение заказов пользователя

```python
from backend.models import User, Order

user = db.query(User).filter(
    User.telegram_id == 123456789
).first()

orders = db.query(Order).filter(
    Order.user_id == user.id
).order_by(Order.created_at.desc()).all()

for order in orders:
    print(f"Заказ #{order.id}: {order.total_amount} руб.")
    for item in order.items:
        print(f"  - {item.product.name} x{item.quantity}")
```

### Обновление статуса заказа

```python
order = db.query(Order).filter(Order.id == 1).first()
order.status = "confirmed"
db.commit()
```

## Примеры Telegram Web App SDK

### Инициализация

```javascript
// frontend/src/App.jsx

useEffect(() => {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp
    
    // Готовность приложения
    tg.ready()
    
    // Развернуть на весь экран
    tg.expand()
    
    // Применить тему
    document.body.style.backgroundColor = tg.backgroundColor
    
    // Показать главную кнопку
    tg.MainButton.setText('Оформить заказ')
    tg.MainButton.show()
    tg.MainButton.onClick(() => {
      // Обработка клика
    })
  }
}, [])
```

### Haptic Feedback

```javascript
// Легкая вибрация
window.Telegram.WebApp.HapticFeedback.impactOccurred('light')

// Средняя вибрация
window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')

// Сильная вибрация
window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy')

// Уведомление
window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
window.Telegram.WebApp.HapticFeedback.notificationOccurred('error')
window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning')
```

### Показ уведомлений

```javascript
// Простое уведомление
window.Telegram.WebApp.showAlert('Товар добавлен в корзину!')

// Подтверждение
window.Telegram.WebApp.showConfirm(
  'Вы уверены, что хотите удалить товар?',
  (confirmed) => {
    if (confirmed) {
      // Удаляем товар
    }
  }
)

// Popup с кнопками
window.Telegram.WebApp.showPopup({
  title: 'Выберите действие',
  message: 'Что вы хотите сделать с этим товаром?',
  buttons: [
    { id: 'add', type: 'default', text: 'Добавить в корзину' },
    { id: 'favorite', type: 'default', text: 'В избранное' },
    { type: 'cancel' }
  ]
}, (buttonId) => {
  if (buttonId === 'add') {
    // Добавляем в корзину
  } else if (buttonId === 'favorite') {
    // Добавляем в избранное
  }
})
```

### Закрытие приложения

```javascript
// Закрыть Mini App
window.Telegram.WebApp.close()

// Открыть ссылку
window.Telegram.WebApp.openLink('https://example.com')

// Открыть Telegram ссылку
window.Telegram.WebApp.openTelegramLink('https://t.me/channel')
```

## Полезные скрипты

### Бэкап базы данных

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
cp backend/iqos_shop.db "backups/iqos_shop_$DATE.db"
echo "Backup created: iqos_shop_$DATE.db"
```

### Очистка старых заказов

```python
# cleanup_old_orders.py

from datetime import datetime, timedelta
from backend.database import SessionLocal
from backend.models import Order

db = SessionLocal()

# Удаляем отмененные заказы старше 30 дней
thirty_days_ago = datetime.utcnow() - timedelta(days=30)

old_orders = db.query(Order).filter(
    Order.status == "cancelled",
    Order.created_at < thirty_days_ago
).all()

for order in old_orders:
    db.delete(order)

db.commit()
print(f"Удалено {len(old_orders)} старых заказов")
```

### Экспорт заказов в CSV

```python
# export_orders.py

import csv
from backend.database import SessionLocal
from backend.models import Order

db = SessionLocal()
orders = db.query(Order).all()

with open('orders.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['ID', 'Дата', 'Пользователь', 'Сумма', 'Статус'])
    
    for order in orders:
        writer.writerow([
            order.id,
            order.created_at.strftime('%Y-%m-%d %H:%M'),
            order.user.username,
            order.total_amount,
            order.status
        ])

print(f"Экспортировано {len(orders)} заказов")
```
