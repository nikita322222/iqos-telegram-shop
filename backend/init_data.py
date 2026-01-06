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
    products = [
        {
            "name": "IQOS ILUMA PRIME",
            "description": "Премиальное устройство с технологией нагрева без лезвия",
            "price": 12990,
            "category": "Устройства",
            "badge": "ХИТ",
            "stock": 10,
            "image_url": "https://via.placeholder.com/300x300?text=ILUMA+PRIME"
        },
        {
            "name": "IQOS ILUMA",
            "description": "Новое поколение устройств IQOS",
            "price": 7990,
            "category": "Устройства",
            "badge": "NEW",
            "stock": 15,
            "image_url": "https://via.placeholder.com/300x300?text=ILUMA"
        },
        {
            "name": "TEREA Amber",
            "description": "Стики с насыщенным табачным вкусом",
            "price": 190,
            "category": "Стики",
            "badge": None,
            "stock": 100,
            "image_url": "https://via.placeholder.com/300x300?text=TEREA+Amber"
        },
        {
            "name": "TEREA Blue",
            "description": "Стики с ментоловым вкусом",
            "price": 190,
            "category": "Стики",
            "badge": None,
            "stock": 100,
            "image_url": "https://via.placeholder.com/300x300?text=TEREA+Blue"
        },
        {
            "name": "TEREA Yellow",
            "description": "Стики с мягким вкусом",
            "price": 190,
            "category": "Стики",
            "badge": "СКИДКА",
            "stock": 80,
            "image_url": "https://via.placeholder.com/300x300?text=TEREA+Yellow"
        },
        {
            "name": "Чехол для IQOS",
            "description": "Защитный чехол из премиальной кожи",
            "price": 1490,
            "category": "Аксессуары",
            "badge": None,
            "stock": 25,
            "image_url": "https://via.placeholder.com/300x300?text=Case"
        },
        {
            "name": "Зарядное устройство",
            "description": "Быстрая зарядка для IQOS",
            "price": 990,
            "category": "Аксессуары",
            "badge": None,
            "stock": 30,
            "image_url": "https://via.placeholder.com/300x300?text=Charger"
        },
        {
            "name": "Набор для чистки",
            "description": "Профессиональный набор для ухода за устройством",
            "price": 490,
            "category": "Аксессуары",
            "badge": None,
            "stock": 50,
            "image_url": "https://via.placeholder.com/300x300?text=Cleaning+Kit"
        }
    ]
    
    for product_data in products:
        existing = db.query(models.Product).filter(
            models.Product.name == product_data["name"]
        ).first()
        
        if not existing:
            product = models.Product(**product_data)
            db.add(product)
            print(f"✅ Создан товар: {product_data['name']}")
    
    db.commit()


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
