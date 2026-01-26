"""
Добавление администратора с ID 279680413
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Production database URL
DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def add_admin():
    db = SessionLocal()
    
    try:
        telegram_id = 279680413
        
        # Проверяем, существует ли пользователь
        result = db.execute(
            text("SELECT id, role, is_active FROM users WHERE telegram_id = :telegram_id"),
            {"telegram_id": telegram_id}
        ).fetchone()
        
        if result:
            user_id, current_role, is_active = result
            print(f"✅ Пользователь найден: ID={user_id}, role={current_role}, is_active={is_active}")
            
            # Обновляем роль на admin и активируем
            db.execute(
                text("UPDATE users SET role = 'admin', is_active = true WHERE telegram_id = :telegram_id"),
                {"telegram_id": telegram_id}
            )
            db.commit()
            print(f"✅ Пользователь {telegram_id} назначен администратором")
        else:
            print(f"⚠️ Пользователь {telegram_id} не найден в базе")
            print(f"📝 Создаем нового пользователя с ролью admin...")
            
            # Создаем нового пользователя с ролью admin
            db.execute(
                text("""
                    INSERT INTO users (telegram_id, role, is_active, created_at)
                    VALUES (:telegram_id, 'admin', true, NOW())
                """),
                {"telegram_id": telegram_id}
            )
            db.commit()
            print(f"✅ Администратор {telegram_id} успешно создан")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Добавление администратора 279680413...")
    add_admin()
    print("✅ Готово!")
