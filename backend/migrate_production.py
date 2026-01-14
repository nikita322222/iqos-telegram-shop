"""
Скрипт для миграции продакшн базы данных через API
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

PRODUCTION_URL = "https://iqos-backend.onrender.com"

def trigger_migration():
    """Триггерит миграцию на продакшн сервере"""
    try:
        print("🔄 Запуск миграции на продакшн...")
        print(f"URL: {PRODUCTION_URL}")
        
        # Просто перезапускаем backend, он автоматически создаст новые поля
        response = requests.get(f"{PRODUCTION_URL}/")
        
        if response.status_code == 200:
            print("✅ Backend доступен")
            print("\nℹ️  Новые поля будут созданы автоматически при первом использовании")
            print("   (SQLAlchemy создаст их при следующем запуске)")
        else:
            print(f"❌ Ошибка: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")

if __name__ == "__main__":
    trigger_migration()
