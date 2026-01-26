"""
Миграция: Добавление таблицы broadcasts для рассылок
"""
from database import SessionLocal, engine
from sqlalchemy import text

def migrate():
    db = SessionLocal()
    
    try:
        # Создаем таблицу broadcasts
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS broadcasts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message TEXT NOT NULL,
                status VARCHAR DEFAULT 'draft',
                send_immediately BOOLEAN DEFAULT 1,
                scheduled_time DATETIME,
                repeat_enabled BOOLEAN DEFAULT 0,
                repeat_interval_hours INTEGER,
                repeat_count INTEGER DEFAULT 0,
                max_repeats INTEGER,
                last_sent_at DATETIME,
                total_recipients INTEGER DEFAULT 0,
                sent_count INTEGER DEFAULT 0,
                failed_count INTEGER DEFAULT 0,
                created_by INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        """))
        
        db.commit()
        print("✅ Таблица broadcasts создана")
        
    except Exception as e:
        print(f"❌ Ошибка миграции: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Запуск миграции broadcasts...")
    migrate()
    print("✅ Миграция завершена")
