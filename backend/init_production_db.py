"""
Инициализация продакшн базы данных
"""
import os
os.environ['DATABASE_URL'] = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

from database import init_db, SessionLocal
import models

print("🔄 Создание таблиц в продакшн базе...")
init_db()
print("✅ Таблицы созданы!")

# Создаем тестового пользователя
db = SessionLocal()
try:
    user_count = db.query(models.User).count()
    if user_count == 0:
        user = models.User(
            telegram_id=576978144,
            username="nikita_user",
            first_name="Nikita",
            last_name="Morozov",
            is_active=True
        )
        db.add(user)
        db.commit()
        print("✅ Тестовый пользователь создан")
    else:
        print(f"ℹ️  Пользователей в базе: {user_count}")
finally:
    db.close()

print("\n✅ Инициализация завершена!")
print("Теперь запусти: python3 upload_to_production.py")
