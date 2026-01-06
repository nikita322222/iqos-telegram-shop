"""
Скрипт для инициализации базы данных с тестовыми данными
"""
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
import models


def create_test_users(db: Session):
    """Создание тестовых пользователей"""
    # Добавьте сюда Telegram ID пользователей, которым нужен доступ
    test_users = [
        {
            "telegram_id": 576978144,
            "username": "nikita_user",
            "first_name": "Nikita",
            "last_name": "Morozov"
        }
    ]
    
    for user_data in test_users:
        existing = db.query(models.User).filter(
            models.User.telegram_id == user_data["telegram_id"]
        ).first()
        
        if not existing:
            user = models.User(**user_data)
            db.add(user)
            print(f"✅ Создан пользователь: {user_data['username']}")
    
    db.commit()


def create_test_products(db: Session):
    """Создание тестовых товаров"""
    # Тестовые товары удалены - используйте import_excel.py для загрузки реальных товаров
    print("ℹ️  Тестовые товары не создаются. Используйте import_excel.py для импорта.")
    pass


def main():
    """Основная функция инициализации"""
    print("🚀 Инициализация базы данных...")
    
    # Создаем таблицы
    init_db()
    print("✅ Таблицы созданы")
    
    # Получаем сессию
    db = SessionLocal()
    
    try:
        # Создаем тестовые данные
        create_test_users(db)
        create_test_products(db)
        
        print("\n✅ База данных успешно инициализирована!")
        print("\n⚠️  ВАЖНО: Не забудьте добавить реальные Telegram ID в функцию create_test_users()")
        
    finally:
        db.close()


if __name__ == "__main__":
    main()
