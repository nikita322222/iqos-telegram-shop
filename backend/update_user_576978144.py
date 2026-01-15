#!/usr/bin/env python3
"""
Скрипт для обновления данных пользователя 576978144 в production базе
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User

# Production PostgreSQL URL
DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

def update_user():
    """Обновление данных пользователя"""
    print("🔄 Подключение к production базе данных...")
    
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Находим пользователя
        user = db.query(User).filter(User.telegram_id == 576978144).first()
        
        if not user:
            print("❌ Пользователь с telegram_id 576978144 не найден")
            return
        
        print(f"\n📋 Текущие данные пользователя:")
        print(f"   ID: {user.id}")
        print(f"   Telegram ID: {user.telegram_id}")
        print(f"   Username: {user.username}")
        print(f"   First Name: {user.first_name}")
        print(f"   Last Name: {user.last_name}")
        
        # Обновляем данные
        user.username = "qwnklx"
        user.first_name = "Пользователь"  # Можно изменить на реальное имя
        user.last_name = None
        
        db.commit()
        db.refresh(user)
        
        print(f"\n✅ Данные пользователя обновлены:")
        print(f"   Username: @{user.username}")
        print(f"   First Name: {user.first_name}")
        print(f"   Last Name: {user.last_name}")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_user()
