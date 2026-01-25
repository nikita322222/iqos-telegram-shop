"""
Проверка роли пользователя
"""
from sqlalchemy import create_engine, text

# Production
DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT telegram_id, username, first_name, last_name, role 
        FROM users 
        WHERE telegram_id = 576978144
    """))
    
    user = result.fetchone()
    
    if user:
        print(f"✅ Пользователь найден:")
        print(f"   Telegram ID: {user[0]}")
        print(f"   Username: {user[1]}")
        print(f"   Имя: {user[2]} {user[3]}")
        print(f"   Роль: {user[4]}")
        
        if user[4] == 'admin':
            print("\n✅ У вас есть права администратора!")
        else:
            print(f"\n❌ Ваша роль: {user[4]}, нужна роль 'admin'")
            print("Обновляем роль...")
            conn.execute(text("UPDATE users SET role = 'admin' WHERE telegram_id = 576978144"))
            conn.commit()
            print("✅ Роль обновлена на 'admin'")
    else:
        print("❌ Пользователь с ID 576978144 не найден в базе")
        print("Сначала откройте клиентское приложение чтобы создать аккаунт")
