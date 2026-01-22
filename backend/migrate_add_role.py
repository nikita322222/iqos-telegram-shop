"""
Миграция: Добавление поля role в таблицу users
"""
import sys
import os

# Добавляем путь к backend для импорта модулей
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from config import settings

def migrate():
    """Добавляет поле role в таблицу users"""
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        # Проверяем существует ли колонка
        if settings.database_url.startswith('postgresql'):
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='role'
            """))
            exists = result.fetchone() is not None
        else:  # SQLite
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            exists = 'role' in columns
        
        if not exists:
            print("➕ Добавляем колонку 'role' в таблицу users...")
            
            if settings.database_url.startswith('postgresql'):
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN role VARCHAR DEFAULT 'customer'
                """))
            else:  # SQLite
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
    print("🔄 Запуск миграции: добавление роли пользователя")
    migrate()
    print("✅ Миграция завершена")
