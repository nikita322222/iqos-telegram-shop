import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
MINI_APP_URL = os.getenv("MINI_APP_URL", "http://localhost:5173")
ADMIN_TELEGRAM_ID = os.getenv("ADMIN_TELEGRAM_ID")
ADMIN_GROUP_ID = os.getenv("ADMIN_GROUP_ID")  # ID группы для уведомлений о заказах

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN не установлен в .env файле")
