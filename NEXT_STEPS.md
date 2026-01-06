# 🎯 Следующие шаги

## Немедленные действия

### 1. Узнайте свой Telegram ID
Напишите боту [@userinfobot](https://t.me/userinfobot) и скопируйте ваш ID.

### 2. Добавьте свой ID в базу
Откройте `backend/init_data.py` и замените `123456789` на ваш реальный Telegram ID:

```python
test_users = [
    {
        "telegram_id": ВАШ_TELEGRAM_ID,  # <-- Здесь
        "username": "ваш_username",
        "first_name": "Ваше",
        "last_name": "Имя"
    }
]
```

### 3. Установите зависимости и запустите

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python init_data.py
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Bot:**
```bash
cd bot
pip install -r requirements.txt
python main.py
```

### 4. Настройте Menu Button в боте

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/mybots` → выберите вашего бота
3. Bot Settings → Menu Button → Configure menu button
4. URL: `http://localhost:5173`
5. Text: "Открыть магазин"

### 5. Протестируйте

Откройте вашего бота в Telegram и отправьте `/start`

## Настройка для продакшена

### 1. Хостинг Backend

Рекомендуемые варианты:
- **Railway.app** - простой деплой Python приложений
- **Render.com** - бесплатный tier для начала
- **DigitalOcean** - VPS с полным контролем
- **Heroku** - классический вариант

Не забудьте:
- Сменить `SECRET_KEY` в `.env`
- Использовать PostgreSQL вместо SQLite
- Настроить HTTPS
- Обновить `CORS_ORIGINS`

### 2. Хостинг Frontend

Рекомендуемые варианты:
- **Vercel** - идеально для React приложений
- **Netlify** - простой деплой
- **Cloudflare Pages** - быстрый CDN
- **GitHub Pages** - бесплатный вариант

Команды:
```bash
cd frontend
npm run build
# Загрузите папку dist на хостинг
```

Обновите `VITE_API_URL` в `.env` на продакшн URL backend.

### 3. Запуск бота на сервере

Используйте systemd или supervisor для автозапуска:

**systemd service** (`/etc/systemd/system/iqos-bot.service`):
```ini
[Unit]
Description=IQOS Telegram Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/bot
ExecStart=/usr/bin/python3 main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Команды:
```bash
sudo systemctl enable iqos-bot
sudo systemctl start iqos-bot
sudo systemctl status iqos-bot
```

### 4. Обновите настройки бота

В `bot/.env`:
```env
MINI_APP_URL=https://your-frontend-url.com
ADMIN_TELEGRAM_ID=ваш_admin_id
```

В BotFather обновите Menu Button URL на продакшн URL.

## Добавление функционала

### Админ-панель

Создайте отдельные endpoints в `backend/main.py`:
```python
@app.post("/api/admin/products")
def create_product(product: schemas.ProductCreate, admin_id: int):
    # Проверка прав администратора
    # Создание товара
    pass
```

### Система оплаты

Интегрируйте Telegram Payments или Stripe:
```python
from aiogram.types import LabeledPrice, PreCheckoutQuery

@dp.message(F.text == "Оплатить")
async def process_payment(message: Message):
    await bot.send_invoice(
        chat_id=message.chat.id,
        title="Заказ в IQOS Shop",
        description="Описание заказа",
        payload="order_123",
        provider_token="YOUR_PAYMENT_TOKEN",
        currency="BYN",
        prices=[LabeledPrice(label="Товар", amount=10000)]
    )
```

### Push-уведомления

Добавьте в `bot/main.py`:
```python
async def send_order_status_update(telegram_id: int, order_id: int, status: str):
    await bot.send_message(
        chat_id=telegram_id,
        text=f"Статус заказа №{order_id} изменен: {status}"
    )
```

### Поиск товаров

В `backend/main.py`:
```python
@app.get("/api/products/search")
def search_products(q: str, db: Session = Depends(get_db)):
    products = db.query(models.Product).filter(
        models.Product.name.ilike(f"%{q}%")
    ).all()
    return products
```

В `frontend/src/pages/CatalogPage.jsx`:
```jsx
const [searchQuery, setSearchQuery] = useState('')

// Добавьте input для поиска
<input
  type="search"
  placeholder="Поиск товаров..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

## Мониторинг и логирование

### Backend логи
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### Мониторинг ошибок
Используйте Sentry:
```bash
pip install sentry-sdk
```

```python
import sentry_sdk
sentry_sdk.init(dsn="YOUR_SENTRY_DSN")
```

## Безопасность

### Обязательно:
- [ ] Смените все секретные ключи
- [ ] Используйте HTTPS везде
- [ ] Настройте rate limiting
- [ ] Регулярно обновляйте зависимости
- [ ] Делайте бэкапы базы данных
- [ ] Логируйте все важные действия

### Rate Limiting
```bash
pip install slowapi
```

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/products")
@limiter.limit("100/minute")
def get_products():
    pass
```

## Масштабирование

### База данных
Переход на PostgreSQL:
```python
# backend/config.py
database_url: str = "postgresql://user:password@localhost/iqos_shop"
```

### Кэширование
Используйте Redis:
```bash
pip install redis
```

```python
import redis
cache = redis.Redis(host='localhost', port=6379, db=0)

@app.get("/api/products")
def get_products():
    cached = cache.get('products')
    if cached:
        return json.loads(cached)
    
    products = db.query(models.Product).all()
    cache.setex('products', 300, json.dumps(products))
    return products
```

## Полезные ресурсы

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [aiogram Documentation](https://docs.aiogram.dev/)

## Поддержка

Если возникли вопросы:
1. Проверьте `SETUP.md` - там есть раздел Troubleshooting
2. Проверьте логи всех компонентов
3. Убедитесь, что все сервисы запущены
4. Проверьте переменные окружения

Удачи с проектом! 🚀
