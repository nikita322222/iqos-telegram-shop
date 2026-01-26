"""
Миграция: Добавление поля type в таблицу categories
"""
from sqlalchemy import create_engine, text
from config import settings

def migrate():
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        print("🔄 Добавление поля 'type' в таблицу categories...")
        
        # Проверяем есть ли уже поле
        if 'sqlite' in settings.database_url:
            result = conn.execute(text("PRAGMA table_info(categories)"))
            columns = [row[1] for row in result.fetchall()]
        else:  # PostgreSQL
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='categories' AND column_name='type'
            """))
            columns = [row[0] for row in result.fetchall()]
            
        if 'type' not in columns:
            print("➕ Добавляем колонку 'type'...")
            conn.execute(text("ALTER TABLE categories ADD COLUMN type VARCHAR DEFAULT 'devices'"))
            conn.commit()
            print("✅ Колонка 'type' добавлена")
        else:
            print("ℹ️ Колонка 'type' уже существует")

if __name__ == "__main__":
    print("🚀 Запуск миграции")
    migrate()
    print("✅ Миграция завершена")
