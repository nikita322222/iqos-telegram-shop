"""
Скрипт для добавления полей сохраненных данных в таблицу users
"""
from sqlalchemy import text
from database import engine

def add_saved_fields():
    """Добавляет новые поля в таблицу users"""
    
    fields_to_add = [
        "saved_full_name VARCHAR",
        "saved_phone VARCHAR",
        "saved_delivery_address TEXT",
        "saved_city VARCHAR",
        "saved_europost_office VARCHAR",
        "saved_delivery_type VARCHAR"
    ]
    
    with engine.connect() as conn:
        for field in fields_to_add:
            field_name = field.split()[0]
            try:
                # Проверяем, существует ли поле
                result = conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='{field_name}'
                """))
                
                if result.fetchone() is None:
                    # Поле не существует, добавляем
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {field}"))
                    conn.commit()
                    print(f"✅ Добавлено поле: {field_name}")
                else:
                    print(f"ℹ️  Поле уже существует: {field_name}")
                    
            except Exception as e:
                print(f"⚠️  Ошибка при добавлении {field_name}: {e}")
                conn.rollback()
    
    print("\n✅ Миграция завершена!")

if __name__ == "__main__":
    print("🔄 Добавление полей для сохранения данных пользователя...")
    add_saved_fields()
