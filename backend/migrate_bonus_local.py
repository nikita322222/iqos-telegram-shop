#!/usr/bin/env python3
"""
Миграция для добавления бонусной системы в локальную SQLite базу
"""
import sqlite3

def migrate():
    """Добавление полей для бонусной системы"""
    print("🔄 Подключение к локальной базе данных...")
    
    conn = sqlite3.connect('iqos_shop.db')
    cursor = conn.cursor()
    
    try:
        # Добавляем поля в таблицу users
        print("📝 Добавление полей в таблицу users...")
        
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN bonus_balance REAL DEFAULT 0.0")
            print("✅ Добавлено поле bonus_balance")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⚠️ Поле bonus_balance уже существует")
            else:
                raise
        
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN total_orders_count INTEGER DEFAULT 0")
            print("✅ Добавлено поле total_orders_count")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⚠️ Поле total_orders_count уже существует")
            else:
                raise
        
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN loyalty_level VARCHAR DEFAULT 'bronze'")
            print("✅ Добавлено поле loyalty_level")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⚠️ Поле loyalty_level уже существует")
            else:
                raise
        
        # Добавляем поля в таблицу orders
        print("📝 Добавление полей в таблицу orders...")
        
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN bonus_used REAL DEFAULT 0.0")
            print("✅ Добавлено поле bonus_used")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⚠️ Поле bonus_used уже существует")
            else:
                raise
        
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN bonus_earned REAL DEFAULT 0.0")
            print("✅ Добавлено поле bonus_earned")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⚠️ Поле bonus_earned уже существует")
            else:
                raise
        
        # Создаем таблицу bonus_transactions
        print("📝 Создание таблицы bonus_transactions...")
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bonus_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                transaction_type VARCHAR NOT NULL,
                description VARCHAR,
                order_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )
        """)
        print("✅ Таблица bonus_transactions создана")
        
        # Обновляем счетчик заказов для существующих пользователей
        print("📝 Обновление счетчика заказов...")
        
        cursor.execute("""
            UPDATE users 
            SET total_orders_count = (
                SELECT COUNT(*) 
                FROM orders 
                WHERE orders.user_id = users.id 
                AND orders.status IN ('confirmed', 'completed')
            )
        """)
        print("✅ Счетчик заказов обновлен")
        
        # Обновляем уровни лояльности
        print("📝 Обновление уровней лояльности...")
        
        cursor.execute("""
            UPDATE users 
            SET loyalty_level = CASE 
                WHEN total_orders_count >= 16 THEN 'gold'
                WHEN total_orders_count >= 6 THEN 'silver'
                ELSE 'bronze'
            END
        """)
        print("✅ Уровни лояльности обновлены")
        
        conn.commit()
        print("\n✅ Миграция завершена успешно!")
        
    except Exception as e:
        print(f"❌ Ошибка миграции: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
