# ⚡ Быстрая справка

## Команды запуска

### Backend
```bash
cd backend
uvicorn main:app --reload
# http://localhost:8000
```

### Frontend
```bash
cd frontend
npm run dev
# http://localhost:5173
```

### Bot
```bash
cd bot
python main.py
```

## Основные файлы

| Файл | Описание |
|------|----------|
| `backend/main.py` | API endpoints |
| `backend/models.py` | Модели БД |
| `backend/init_data.py` | Инициализация данных |
| `bot/main.py` | Логика бота |
| `frontend/src/App.jsx` | Главный компонент |
| `frontend/src/api/client.js` | API клиент |

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/products` | Список товаров |
| GET | `/api/products/{id}` | Товар по ID |
| POST | `/api/orders` | Создать заказ |
| GET | `/api/orders` | Мои заказы |
| GET | `/api/favorites` | Избранное |
| POST | `/api/favorites` | Добавить в избранное |
| DELETE | `/api/favorites/{id}` | Удалить из избранного |
| GET | `/api/users/me` | Текущий пользователь |

## Структура БД

### Users
- `telegram_id` - Telegram ID (уникальный)
- `username` - Username
- `first_name`, `last_name` - Имя
- `is_active` - Активен ли

### Products
- `name` - Название
- `price` - Цена
- `category` - Категория
- `badge` - Бейдж (ХИТ/NEW/СКИДКА)
- `stock` - Остаток

### Orders
- `user_id` - ID пользователя
- `total_amount` - Сумма
- `status` - Статус (pending/confirmed/completed/cancelled)
- `delivery_address` - Адрес
- `phone` - Телефон

## Переменные окружения

### Backend (.env)
```env
DATABASE_URL=sqlite:///./iqos_shop.db
BOT_TOKEN=your_bot_token
SECRET_KEY=your_secret_key
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

### Bot (.env)
```env
BOT_TOKEN=your_bot_token
BACKEND_URL=http://localhost:8000
MINI_APP_URL=http://localhost:5173
ADMIN_TELEGRAM_ID=your_admin_id
```

## Добавление пользователя

```python
# backend/init_data.py
test_users = [
    {
        "telegram_id": 123456789,  # Ваш ID
        "username": "username",
        "first_name": "Имя",
        "last_name": "Фамилия"
    }
]
```

Затем:
```bash
cd backend
python init_data.py
```

## Добавление товара

```python
from backend.database import SessionLocal
from backend.models import Product

db = SessionLocal()
product = Product(
    name="Название",
    description="Описание",
    price=1000,
    category="Категория",
    badge="ХИТ",  # или NEW, СКИДКА, None
    stock=10,
    image_url="https://..."
)
db.add(product)
db.commit()
```

## Telegram Web App SDK

### Инициализация
```javascript
const tg = window.Telegram.WebApp
tg.ready()
tg.expand()
```

### Haptic Feedback
```javascript
tg.HapticFeedback.impactOccurred('light')
tg.HapticFeedback.notificationOccurred('success')
```

### Уведомления
```javascript
tg.showAlert('Сообщение')
tg.showConfirm('Вопрос?', (confirmed) => {})
```

### Главная кнопка
```javascript
tg.MainButton.setText('Текст')
tg.MainButton.show()
tg.MainButton.onClick(() => {})
```

## React Context (Корзина)

```javascript
import { useCart } from './context/CartContext'

const { 
  cart,              // Массив товаров
  addToCart,         // Добавить товар
  removeFromCart,    // Удалить товар
  updateQuantity,    // Изменить количество
  clearCart,         // Очистить корзину
  getTotalPrice,     // Общая сумма
  getTotalItems      // Количество товаров
} = useCart()
```

## Полезные команды

### Пересоздать БД
```bash
cd backend
rm iqos_shop.db
python init_data.py
```

### Просмотр БД
```bash
sqlite3 backend/iqos_shop.db
.tables
SELECT * FROM users;
.quit
```

### Обновление зависимостей
```bash
# Backend
cd backend
pip install -r requirements.txt --upgrade

# Frontend
cd frontend
npm update
```

### Сборка для продакшена
```bash
cd frontend
npm run build
# Результат в папке dist/
```

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| Бот не отвечает | Проверьте BOT_TOKEN и запущен ли бот |
| "Доступ ограничен" | Добавьте Telegram ID в init_data.py |
| CORS ошибка | Добавьте URL в CORS_ORIGINS |
| Товары не загружаются | Проверьте VITE_API_URL и запущен ли backend |
| Ошибка авторизации | Проверьте BOT_TOKEN в backend и bot |

## Статусы заказов

- `pending` - Ожидает подтверждения
- `confirmed` - Подтвержден
- `completed` - Доставлен
- `cancelled` - Отменен

## Категории товаров

- Устройства
- Стики
- Аксессуары

## Бейджи товаров

- `ХИТ` - Красный
- `NEW` - Зеленый
- `СКИДКА` - Оранжевый

## Узнать Telegram ID

Напишите боту [@userinfobot](https://t.me/userinfobot)

## Настройка Menu Button

1. [@BotFather](https://t.me/BotFather)
2. `/mybots` → выбрать бота
3. Bot Settings → Menu Button
4. Configure menu button
5. URL: `http://localhost:5173` (dev) или `https://your-url.com` (prod)

## Документация

- `README.md` - Основное описание
- `SETUP.md` - Инструкция по установке
- `API.md` - Документация API
- `FEATURES.md` - Список функций
- `NEXT_STEPS.md` - Следующие шаги
- `DEPLOYMENT.md` - Деплой
- `EXAMPLES.md` - Примеры кода
- `CHECKLIST.md` - Чеклист
- `PROJECT_OVERVIEW.md` - Обзор проекта

## Контакты и ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [aiogram Docs](https://docs.aiogram.dev/)

---

**Версия:** 1.0.0  
**Дата:** 24 декабря 2024
