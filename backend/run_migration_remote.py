"""
Скрипт для выполнения миграции на удаленной PostgreSQL базе
"""
import psycopg2

# URL базы данных (скопируй из Render Dashboard → External Database URL)
DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

def run_migration():
    """Выполняет миграцию базы данных"""
    
    print("🔄 Подключение к базе данных...")
    
    try:
        # Подключаемся к базе
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        print("✅ Подключено!")
        print("\n🔄 Добавление полей...")
        
        # SQL команды для добавления полей
        migrations = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_full_name VARCHAR",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_phone VARCHAR",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_delivery_address TEXT",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_city VARCHAR",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_europost_office VARCHAR",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS saved_delivery_type VARCHAR"
        ]
        
        # Выполняем каждую команду
        for migration in migrations:
            field_name = migration.split("ADD COLUMN IF NOT EXISTS ")[1].split()[0]
            try:
                cursor.execute(migration)
                conn.commit()
                print(f"✅ Добавлено поле: {field_name}")
            except Exception as e:
                print(f"⚠️  Ошибка при добавлении {field_name}: {e}")
                conn.rollback()
        
        # Проверяем что поля добавлены
        print("\n🔍 Проверка добавленных полей...")
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name LIKE 'saved_%'
            ORDER BY column_name
        """)
        
        fields = cursor.fetchall()
        print(f"\n✅ Найдено {len(fields)} полей:")
        for field in fields:
            print(f"   - {field[0]}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Миграция завершена успешно!")
        print("\nТеперь можешь тестировать автозаполнение в боте!")
        
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        print("\nПроверь что:")
        print("1. URL базы данных правильный")
        print("2. База данных доступна")
        print("3. Установлен psycopg2: pip install psycopg2-binary")

if __name__ == "__main__":
    print("=" * 60)
    print("  Миграция PostgreSQL базы данных")
    print("=" * 60)
    run_migration()
