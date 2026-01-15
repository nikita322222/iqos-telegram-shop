#!/usr/bin/env python3
"""
Миграция для добавления бонусной системы
"""
import os
from sqlalchemy import create_engine, text

# Production PostgreSQL URL
DATABASE_URL = os.getenv('DATABASE_URL', "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop")

def migrate():
    """Добавление полей для бонусной системы"""
    print("🔄 Подключение к базе данных...")
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Добавляем поля в таблицу users
            print("📝 Добавление полей в таблицу users...")
            
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS bonus_balance FLOAT DEFAULT 0.0,
                ADD COLUMN IF NOT EXISTS total_orders_count INTEGER DEFAULT 0,
                ADD COLUMN IF NOT EXISTS loyalty_level VARCHAR DEFAULT 'bronze'
            """))
            conn.commit()
            print("✅ Поля добавлены в таблицу users")
            
            # Добавляем поля в таблицу orders
            print("📝 Добавление полей в таблицу orders...")
            
            conn.execute(text("""
                ALTER TABLE orders 
                ADD COLUMN IF NOT EXISTS bonus_used FLOAT DEFAULT 0.0,
                ADD COLUMN IF NOT EXISTS bonus_earned FLOAT DEFAULT 0.0
            """))
            conn.commit()
            print("✅ Поля добавлены в таблицу orders")
            
            # Создаем таблицу bonus_transactions
            print("📝 Создание таблицы bonus_transactions...")
            
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS bonus_transactions (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    amount FLOAT NOT NULL,
                    transaction_type VARCHAR NOT NULL,
                    description VARCHAR,
                    order_id INTEGER REFERENCES orders(id),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✅ Таблица bonus_transactions создана")
            
            # Обновляем счетчик заказов для существующих пользователей
            print("📝 Обновление счетчика заказов...")
            
            conn.execute(text("""
                UPDATE users 
                SET total_orders_count = (
                    SELECT COUNT(*) 
                    FROM orders 
                    WHERE orders.user_id = users.id 
                    AND orders.status IN ('confirmed', 'completed')
                )
            """))
            conn.commit()
            print("✅ Счетчик заказов обновлен")
            
            # Обновляем уровни лояльности
            print("📝 Обновление уровней лояльности...")
            
            conn.execute(text("""
                UPDATE users 
                SET loyalty_level = CASE 
                    WHEN total_orders_count >= 16 THEN 'gold'
                    WHEN total_orders_count >= 6 THEN 'silver'
                    ELSE 'bronze'
                END
            """))
            conn.commit()
            print("✅ Уровни лояльности обновлены")
            
            print("\n✅ Миграция завершена успешно!")
            
        except Exception as e:
            print(f"❌ Ошибка миграции: {e}")
            conn.rollback()

if __name__ == "__main__":
    migrate()
