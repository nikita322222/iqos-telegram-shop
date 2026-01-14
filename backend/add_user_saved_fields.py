"""
Скрипт для добавления полей сохраненных данных в таблицу users
"""
from sqlalchemy import text, inspect
from database import engine, SessionLocal
import models

def add_saved_fields():
    """Добавляет новые поля в таблицу users"""
    
    fields_to_add = {
        "saved_full_name": "VARCHAR",
        "saved_phone": "VARCHAR",
        "saved_delivery_address": "TEXT",
        "saved_city": "VARCHAR",
        "saved_europost_office": "VARCHAR",
        "saved_delivery_type": "VARCHAR"
    }
    
    # Проверяем тип базы данных
    db_url = str(engine.url)
    is_sqlite = 'sqlite' in db_url
    is_postgres = 'postgresql' in db_url
    
    print(f"База данных: {'SQLite' if is_sqlite else 'PostgreSQL' if is_postgres else 'Unknown'}")
    
    # Получаем существующие колонки
    inspector = inspect(engine)
    existing_columns = [col['name'] for col in inspector.get_columns('users')]
    
    with engine.connect() as conn:
        for field_name, field_type in fields_to_add.items():
            try:
                if field_name in existing_columns:
                    print(f"ℹ️  Поле уже существует: {field_name}")
                    continue
                
                # Добавляем поле
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {field_name} {field_type}"))
                conn.commit()
                print(f"✅ Добавлено поле: {field_name}")
                    
            except Exception as e:
                print(f"⚠️  Ошибка при добавлении {field_name}: {e}")
                conn.rollback()
    
    print("\n✅ Миграция завершена!")

if __name__ == "__main__":
    print("🔄 Добавление полей для сохранения данных пользователя...")
    add_saved_fields()
