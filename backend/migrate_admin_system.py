"""
Миграция: Добавление системы администрирования
- Добавление поля role в users
- Создание таблицы categories
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from config import settings

def migrate():
    """Миграция для админ системы"""
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        print("🔄 Миграция админ системы...")
        
        # 1. Добавляем поле role в users
        if settings.database_url.startswith('postgresql'):
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='role'
            """))
            role_exists = result.fetchone() is not None
        else:  # SQLite
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            role_exists = 'role' in columns
        
        if not role_exists:
            print("➕ Добавляем колонку 'role' в users...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN role VARCHAR DEFAULT 'customer'
            """))
            conn.commit()
            print("✅ Колонка 'role' добавлена")
            
            # Устанавливаем роль admin для пользователя 576978144
            print("👑 Устанавливаем роль admin для пользователя 576978144...")
            conn.execute(text("""
                UPDATE users 
                SET role = 'admin' 
                WHERE telegram_id = 576978144
            """))
            conn.commit()
            print("✅ Роль admin установлена")
        else:
            print("ℹ️ Колонка 'role' уже существует")
        
        # 2. Создаем таблицу categories
        if settings.database_url.startswith('postgresql'):
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name='categories'
            """))
            categories_exists = result.fetchone() is not None
        else:  # SQLite
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='categories'
            """))
            categories_exists = result.fetchone() is not None
        
        if not categories_exists:
            print("➕ Создаем таблицу 'categories'...")
            conn.execute(text("""
                CREATE TABLE categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR UNIQUE NOT NULL,
                    description TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    sort_order INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """ if not settings.database_url.startswith('postgresql') else """
                CREATE TABLE categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR UNIQUE NOT NULL,
                    description TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    sort_order INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✅ Таблица 'categories' создана")
            
            # Добавляем существующие категории из products
            print("📦 Импортируем существующие категории...")
            result = conn.execute(text("""
                SELECT DISTINCT category FROM products 
                WHERE category IS NOT NULL AND category != ''
            """))
            categories = result.fetchall()
            
            for idx, (category,) in enumerate(categories):
                conn.execute(text("""
                    INSERT INTO categories (name, sort_order) 
                    VALUES (:name, :sort_order)
                """), {"name": category, "sort_order": idx})
            
            conn.commit()
            print(f"✅ Импортировано {len(categories)} категорий")
        else:
            print("ℹ️ Таблица 'categories' уже существует")

if __name__ == "__main__":
    print("🚀 Запуск миграции админ системы")
    migrate()
    print("✅ Миграция завершена")
