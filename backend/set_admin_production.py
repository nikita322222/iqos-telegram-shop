"""
Установка роли admin для пользователя в production
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

def set_admin():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("👑 Установка роли admin для пользователя 576978144...")
        
        # Проверяем есть ли пользователь
        result = conn.execute(text("SELECT * FROM users WHERE telegram_id = 576978144"))
        user = result.fetchone()
        
        if user:
            print(f"✅ Пользователь найден: {user}")
            conn.execute(text("UPDATE users SET role = 'admin' WHERE telegram_id = 576978144"))
            conn.commit()
            print("✅ Роль admin установлена!")
        else:
            print("❌ Пользователь не найден в базе")
            print("Создаем пользователя...")
            conn.execute(text("""
                INSERT INTO users (telegram_id, username, first_name, role, is_active)
                VALUES (576978144, 'qwnklx', 'Nikita', 'admin', true)
            """))
            conn.commit()
            print("✅ Пользователь создан с ролью admin!")

if __name__ == "__main__":
    set_admin()
