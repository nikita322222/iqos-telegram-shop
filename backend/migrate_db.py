"""
Скрипт для миграции базы данных с новыми полями доставки
"""
import os
from database import engine, Base
import models

def migrate():
    """Пересоздание таблиц с новой структурой"""
    print("🔄 Начинаем миграцию базы данных...")
    
    # Удаляем старую БД
    db_path = "iqos_shop.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"✅ Удалена старая база данных: {db_path}")
    
    # Создаем новые таблицы
    Base.metadata.create_all(bind=engine)
    print("✅ Созданы новые таблицы с обновленной структурой")
    
    # Создаем тестового пользователя
    from database import SessionLocal
    db = SessionLocal()
    try:
        user = models.User(
            telegram_id=576978144,
            username="nikita_user",
            first_name="Nikita",
            last_name="Morozov",
            is_active=True
        )
        db.add(user)
        db.commit()
        print("✅ Создан тестовый пользователь")
    finally:
        db.close()
    
    print("\n✨ Миграция завершена!")
    print("📝 Следующие шаги:")
    print("   1. Импортируйте товары: python3 import_excel.py import /путь/к/файлу.xlsx")
    print("   2. Загрузите на продакшн: python3 upload_to_production.py")

if __name__ == "__main__":
    migrate()
