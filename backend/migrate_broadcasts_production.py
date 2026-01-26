"""
Миграция для продакшена: Добавление таблицы broadcasts
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Production database URL
DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def migrate():
    db = SessionLocal()
    
    try:
        # Создаем таблицу broadcasts
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS broadcasts (
                id SERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                status VARCHAR DEFAULT 'draft',
                send_immediately BOOLEAN DEFAULT TRUE,
                scheduled_time TIMESTAMP,
                repeat_enabled BOOLEAN DEFAULT FALSE,
                repeat_interval_hours INTEGER,
                repeat_count INTEGER DEFAULT 0,
                max_repeats INTEGER,
                last_sent_at TIMESTAMP,
                total_recipients INTEGER DEFAULT 0,
                sent_count INTEGER DEFAULT 0,
                failed_count INTEGER DEFAULT 0,
                created_by INTEGER NOT NULL REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        db.commit()
        print("✅ Таблица broadcasts создана в продакшене")
        
    except Exception as e:
        print(f"❌ Ошибка миграции: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Запуск миграции broadcasts для продакшена...")
    migrate()
    print("✅ Миграция завершена")
