"""
Миграция production: Добавление админ системы
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

def migrate():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("🔄 Миграция админ системы на PRODUCTION...")
        
        # 1. Добавляем role
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='role'
        """))
        role_exists = result.fetchone() is not None
        
        if not role_exists:
            print("➕ Добавляем колонку 'role'...")
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'customer'"))
            conn.commit()
            print("✅ Колонка 'role' добавлена")
            
            print("👑 Устанавливаем роль admin для 576978144...")
            conn.execute(text("UPDATE users SET role = 'admin' WHERE telegram_id = 576978144"))
            conn.commit()
            print("✅ Роль admin установлена")
        else:
            print("ℹ️ Колонка 'role' уже существует")
        
        # 2. Создаем categories
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name='categories'
        """))
        categories_exists = result.fetchone() is not None
        
        if not categories_exists:
            print("➕ Создаем таблицу 'categories'...")
            conn.execute(text("""
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
            
            print("📦 Импортируем категории...")
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
    print("🚀 Запуск миграции на PRODUCTION")
    migrate()
    print("✅ Миграция завершена")
