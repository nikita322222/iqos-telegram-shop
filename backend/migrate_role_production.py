"""
Миграция production: Добавление поля role в таблицу users
"""
from sqlalchemy import create_engine, text

# Production PostgreSQL
DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

def migrate():
    """Добавляет поле role в таблицу users на production"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Проверяем существует ли колонка
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='role'
        """))
        exists = result.fetchone() is not None
        
        if not exists:
            print("➕ Добавляем колонку 'role' в таблицу users...")
            
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
            
            # Проверяем роль пользователя 576978144
            result = conn.execute(text("""
                SELECT role FROM users WHERE telegram_id = 576978144
            """))
            user = result.fetchone()
            
            if user and user[0] != 'admin':
                print("👑 Обновляем роль для пользователя 576978144...")
                conn.execute(text("""
                    UPDATE users 
                    SET role = 'admin' 
                    WHERE telegram_id = 576978144
                """))
                conn.commit()
                print("✅ Роль admin установлена")
            elif user:
                print("✅ Пользователь 576978144 уже является админом")
            else:
                print("⚠️ Пользователь 576978144 не найден в базе")

if __name__ == "__main__":
    print("🔄 Запуск миграции на PRODUCTION")
    print("📍 База данных: PostgreSQL (Render)")
    migrate()
    print("✅ Миграция завершена")
