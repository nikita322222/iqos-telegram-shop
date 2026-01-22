"""
Миграция для добавления таблицы saved_addresses
"""
import psycopg2
import sqlite3

def migrate_postgres():
    """Миграция для PostgreSQL (production)"""
    DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        # Создаем таблицу saved_addresses
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS saved_addresses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR NOT NULL,
                delivery_type VARCHAR NOT NULL,
                address TEXT,
                city VARCHAR,
                europost_office VARCHAR,
                is_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Создаем индекс
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id 
            ON saved_addresses(user_id)
        """)
        
        conn.commit()
        print("✅ PostgreSQL: Таблица saved_addresses создана")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ PostgreSQL ошибка: {e}")
    finally:
        cursor.close()
        conn.close()


def migrate_sqlite():
    """Миграция для SQLite (local)"""
    conn = sqlite3.connect('iqos_shop.db')
    cursor = conn.cursor()
    
    try:
        # Создаем таблицу saved_addresses
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS saved_addresses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name VARCHAR NOT NULL,
                delivery_type VARCHAR NOT NULL,
                address TEXT,
                city VARCHAR,
                europost_office VARCHAR,
                is_default BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Создаем индекс
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id 
            ON saved_addresses(user_id)
        """)
        
        conn.commit()
        print("✅ SQLite: Таблица saved_addresses создана")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ SQLite ошибка: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    print("Запуск миграции saved_addresses...")
    migrate_postgres()
    migrate_sqlite()
    print("\n✅ Миграция завершена!")
