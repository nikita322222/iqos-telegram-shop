# 🚀 Руководство по деплою

## Варианты хостинга

### Backend (FastAPI)

#### 1. Railway.app (Рекомендуется)

**Преимущества:**
- Простой деплой из GitHub
- Автоматические деплои при push
- Бесплатный tier для начала
- Встроенная PostgreSQL

**Шаги:**
1. Создайте аккаунт на [Railway.app](https://railway.app)
2. Подключите GitHub репозиторий
3. Выберите папку `backend`
4. Railway автоматически определит Python проект
5. Добавьте переменные окружения:
   ```
   DATABASE_URL=postgresql://...
   BOT_TOKEN=your_token
   SECRET_KEY=your_secret_key
   CORS_ORIGINS=https://your-frontend-url.com
   ```
6. Деплой произойдет автоматически

**Файлы для Railway:**

`backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

`backend/Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### 2. Render.com

**Преимущества:**
- Бесплатный tier
- Простая настройка
- Автоматические деплои

**Шаги:**
1. Создайте аккаунт на [Render.com](https://render.com)
2. New → Web Service
3. Подключите GitHub репозиторий
4. Настройки:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Добавьте переменные окружения

#### 3. DigitalOcean App Platform

**Преимущества:**
- Надежная инфраструктура
- Масштабируемость
- $5/месяц

**Шаги:**
1. Создайте аккаунт на [DigitalOcean](https://www.digitalocean.com)
2. Apps → Create App
3. Подключите GitHub
4. Выберите `backend` папку
5. Настройте переменные окружения

#### 4. VPS (DigitalOcean Droplet / Linode)

**Для продвинутых пользователей**

```bash
# Подключение к серверу
ssh root@your-server-ip

# Установка зависимостей
apt update
apt install python3.11 python3-pip nginx

# Клонирование проекта
git clone https://github.com/your-repo.git
cd your-repo/backend

# Установка зависимостей
pip install -r requirements.txt

# Установка gunicorn
pip install gunicorn

# Создание systemd service
nano /etc/systemd/system/iqos-api.service
```

`/etc/systemd/system/iqos-api.service`:
```ini
[Unit]
Description=IQOS Shop API
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/usr/bin"
ExecStart=/usr/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

```bash
# Запуск сервиса
systemctl enable iqos-api
systemctl start iqos-api

# Настройка Nginx
nano /etc/nginx/sites-available/iqos-api
```

`/etc/nginx/sites-available/iqos-api`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Активация конфига
ln -s /etc/nginx/sites-available/iqos-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Установка SSL (Let's Encrypt)
apt install certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com
```

### Frontend (React)

#### 1. Vercel (Рекомендуется)

**Преимущества:**
- Идеально для React
- Бесплатный tier
- Автоматические деплои
- CDN

**Шаги:**
1. Создайте аккаунт на [Vercel.com](https://vercel.com)
2. Import Project
3. Подключите GitHub
4. Настройки:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Добавьте переменную окружения:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
6. Deploy

#### 2. Netlify

**Шаги:**
1. Создайте аккаунт на [Netlify.com](https://netlify.com)
2. New site from Git
3. Подключите GitHub
4. Настройки:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Добавьте переменные окружения

#### 3. Cloudflare Pages

**Преимущества:**
- Быстрый CDN
- Бесплатный tier
- DDoS защита

**Шаги:**
1. Создайте аккаунт на [Cloudflare](https://pages.cloudflare.com)
2. Create a project
3. Подключите GitHub
4. Настройки:
   - Build command: `cd frontend && npm install && npm run build`
   - Build output directory: `frontend/dist`

#### 4. GitHub Pages

**Для простых проектов**

`frontend/package.json`:
```json
{
  "scripts": {
    "deploy": "vite build && gh-pages -d dist"
  }
}
```

```bash
npm install --save-dev gh-pages
npm run deploy
```

### Telegram Bot

#### 1. VPS (Рекомендуется для продакшена)

```bash
# Подключение к серверу
ssh root@your-server-ip

# Клонирование проекта
git clone https://github.com/your-repo.git
cd your-repo/bot

# Установка зависимостей
pip install -r requirements.txt

# Создание systemd service
nano /etc/systemd/system/iqos-bot.service
```

`/etc/systemd/system/iqos-bot.service`:
```ini
[Unit]
Description=IQOS Telegram Bot
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/bot
Environment="PATH=/usr/bin"
ExecStart=/usr/bin/python3 main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Запуск
systemctl enable iqos-bot
systemctl start iqos-bot
systemctl status iqos-bot

# Просмотр логов
journalctl -u iqos-bot -f
```

#### 2. Railway.app

Можно разместить бота на том же Railway проекте:

`bot/Procfile`:
```
worker: python main.py
```

#### 3. PythonAnywhere

**Для небольших проектов**

1. Создайте аккаунт на [PythonAnywhere](https://www.pythonanywhere.com)
2. Upload файлы бота
3. Создайте Always-on task
4. Команда: `python3 /home/username/bot/main.py`

## Настройка базы данных

### PostgreSQL на Railway

1. В Railway проекте: New → Database → PostgreSQL
2. Railway автоматически создаст `DATABASE_URL`
3. Обновите `backend/.env`:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

### PostgreSQL на Render

1. New → PostgreSQL
2. Скопируйте Internal Database URL
3. Добавьте в переменные окружения Backend

### Миграция с SQLite на PostgreSQL

```bash
# Установка дополнительных зависимостей
pip install psycopg2-binary

# Экспорт данных из SQLite
python export_sqlite.py

# Импорт в PostgreSQL
python import_postgres.py
```

`export_sqlite.py`:
```python
import json
from backend.database import SessionLocal
from backend.models import User, Product, Order

db = SessionLocal()

data = {
    'users': [u.__dict__ for u in db.query(User).all()],
    'products': [p.__dict__ for p in db.query(Product).all()],
    'orders': [o.__dict__ for o in db.query(Order).all()]
}

with open('data.json', 'w') as f:
    json.dump(data, f, default=str)
```

## Переменные окружения для продакшена

### Backend
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
BOT_TOKEN=your_production_bot_token
SECRET_KEY=generate_strong_random_key_here
CORS_ORIGINS=https://your-frontend-url.com
```

### Frontend
```env
VITE_API_URL=https://your-backend-url.com
```

### Bot
```env
BOT_TOKEN=your_production_bot_token
BACKEND_URL=https://your-backend-url.com
MINI_APP_URL=https://your-frontend-url.com
ADMIN_TELEGRAM_ID=your_admin_telegram_id
```

## Обновление Menu Button

После деплоя обновите URL в BotFather:

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/mybots` → выберите бота
3. Bot Settings → Menu Button → Configure menu button
4. URL: `https://your-frontend-url.com`

## Мониторинг и логирование

### Sentry (Отслеживание ошибок)

```bash
pip install sentry-sdk
```

`backend/main.py`:
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your_sentry_dsn",
    traces_sample_rate=1.0,
)
```

### Логирование в файл

`backend/main.py`:
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

## Бэкапы

### Автоматический бэкап PostgreSQL

```bash
# Создайте cron job
crontab -e

# Добавьте строку (бэкап каждый день в 3:00)
0 3 * * * pg_dump -h host -U user dbname > /backups/db_$(date +\%Y\%m\%d).sql
```

### Бэкап на S3

```bash
pip install boto3
```

```python
import boto3
from datetime import datetime

s3 = boto3.client('s3')

# Бэкап базы
filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
s3.upload_file('iqos_shop.db', 'your-bucket', filename)
```

## Проверка после деплоя

- [ ] Backend API доступен по HTTPS
- [ ] Frontend открывается по HTTPS
- [ ] Telegram Bot отвечает на команды
- [ ] Menu Button открывает правильный URL
- [ ] Можно авторизоваться в Mini App
- [ ] Товары загружаются
- [ ] Можно оформить заказ
- [ ] Администратор получает уведомления
- [ ] SSL сертификаты настроены
- [ ] Логи пишутся корректно
- [ ] Бэкапы настроены

## Troubleshooting

### CORS ошибки
Убедитесь, что URL frontend добавлен в `CORS_ORIGINS` в backend

### Ошибки авторизации
Проверьте, что `BOT_TOKEN` одинаковый в bot и backend

### База данных не подключается
Проверьте формат `DATABASE_URL` и доступность БД

### Бот не отвечает
Проверьте логи: `journalctl -u iqos-bot -f`

### Frontend не загружается
Проверьте `VITE_API_URL` и доступность backend

## Полезные команды

```bash
# Проверка статуса сервисов
systemctl status iqos-api
systemctl status iqos-bot

# Перезапуск
systemctl restart iqos-api
systemctl restart iqos-bot

# Просмотр логов
journalctl -u iqos-api -f
journalctl -u iqos-bot -f

# Обновление кода
cd /path/to/project
git pull
systemctl restart iqos-api
systemctl restart iqos-bot
```

## Безопасность

- [ ] Используйте HTTPS везде
- [ ] Смените все секретные ключи
- [ ] Настройте firewall
- [ ] Регулярно обновляйте зависимости
- [ ] Используйте strong passwords для БД
- [ ] Настройте rate limiting
- [ ] Включите логирование
- [ ] Настройте мониторинг

---

**Готово!** Ваш магазин теперь в продакшене 🚀
