"""
Миграция production: Добавление поля type в таблицу categories
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

def migrate():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("🔄 Добавление поля 'type' в таблицу categories на PRODUCTION...")
        
        # Проверяем есть ли уже поле
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='categories' AND column_name='type'
        """))
        type_exists = result.fetchone() is not None
        
        if not type_exists:
            print("➕ Добавляем колонку 'type'...")
            conn.execute(text("ALTER TABLE categories ADD COLUMN type VARCHAR DEFAULT 'devices'"))
            conn.commit()
            print("✅ Колонка 'type' добавлена")
        else:
            print("ℹ️ Колонка 'type' уже существует")

if __name__ == "__main__":
    print("🚀 Запуск миграции на PRODUCTION")
    migrate()
    print("✅ Миграция завершена")
