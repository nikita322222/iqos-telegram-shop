"""
Добавление пользователя в продакшн базу данных
"""
import os
os.environ['DATABASE_URL'] = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

from database import SessionLocal
import models


def add_user(telegram_id: int):
    """Добавление пользователя в продакшн базу"""
    db = SessionLocal()
    
    try:
        # Проверяем, не существует ли уже
        existing = db.query(models.User).filter(
            models.User.telegram_id == telegram_id
        ).first()
        
        if existing:
            print(f"⚠️  Пользователь с Telegram ID {telegram_id} уже существует в продакшн")
            print(f"   Username: {existing.username}")
            print(f"   Активен: {'Да' if existing.is_active else 'Нет'}")
            
            if not existing.is_active:
                existing.is_active = True
                db.commit()
                print("✅ Пользователь активирован!")
            return
        
        # Создаем нового пользователя
        user = models.User(
            telegram_id=telegram_id,
            is_active=True
        )
        
        db.add(user)
        db.commit()
        
        print(f"✅ Пользователь добавлен в ПРОДАКШН базу!")
        print(f"   Telegram ID: {telegram_id}")
        print(f"   Статус: Активен")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🔄 Добавление пользователя в ПРОДАКШН базу данных...")
    add_user(279680413)
