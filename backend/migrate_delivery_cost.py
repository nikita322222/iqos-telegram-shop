#!/usr/bin/env python3
"""
Миграция для добавления поля delivery_cost в таблицу orders
"""
import os
from sqlalchemy import create_engine, text

# Production PostgreSQL URL
DATABASE_URL = os.getenv('DATABASE_URL', "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop")

def migrate():
    """Добавление поля delivery_cost"""
    print("🔄 Подключение к базе данных...")
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Добавляем поле в таблицу orders
            print("📝 Добавление поля delivery_cost в таблицу orders...")
            
            conn.execute(text("""
                ALTER TABLE orders 
                ADD COLUMN IF NOT EXISTS delivery_cost FLOAT DEFAULT 0.0
            """))
            conn.commit()
            print("✅ Поле delivery_cost добавлено")
            
            print("\n✅ Миграция завершена успешно!")
            
        except Exception as e:
            print(f"❌ Ошибка миграции: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
