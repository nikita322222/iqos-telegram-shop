"""
Скрипт для добавления пользователей в базу данных
"""
import sys
import os

# Устанавливаем DATABASE_URL для продакшн базы
# Раскомментируй если хочешь добавить в продакшн
# os.environ['DATABASE_URL'] = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

from database import SessionLocal
import models


def add_user(telegram_id: int, username: str = None, first_name: str = None, last_name: str = None):
    """Добавление пользователя в базу данных"""
    db = SessionLocal()
    
    try:
        # Проверяем, не существует ли уже
        existing = db.query(models.User).filter(
            models.User.telegram_id == telegram_id
        ).first()
        
        if existing:
            print(f"⚠️  Пользователь с Telegram ID {telegram_id} уже существует")
            print(f"   Username: {existing.username}")
            print(f"   Имя: {existing.first_name} {existing.last_name}")
            print(f"   Активен: {'Да' if existing.is_active else 'Нет'}")
            
            # Предлагаем активировать если неактивен
            if not existing.is_active:
                response = input("\nАктивировать пользователя? (y/n): ")
                if response.lower() == 'y':
                    existing.is_active = True
                    db.commit()
                    print("✅ Пользователь активирован!")
            return
        
        # Создаем нового пользователя
        user = models.User(
            telegram_id=telegram_id,
            username=username,
            first_name=first_name,
            last_name=last_name,
            is_active=True
        )
        
        db.add(user)
        db.commit()
        
        print(f"\n✅ Пользователь добавлен!")
        print(f"   Telegram ID: {telegram_id}")
        if username:
            print(f"   Username: @{username}")
        if first_name or last_name:
            print(f"   Имя: {first_name or ''} {last_name or ''}")
        print(f"   Статус: Активен")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()


def list_users():
    """Показать всех пользователей"""
    db = SessionLocal()
    
    try:
        users = db.query(models.User).all()
        
        if not users:
            print("📭 Пользователей нет")
            return
        
        print(f"\n👥 Всего пользователей: {len(users)}\n")
        print("=" * 80)
        
        for user in users:
            status = "✅ Активен" if user.is_active else "❌ Неактивен"
            print(f"ID: {user.id} | Telegram ID: {user.telegram_id}")
            print(f"Username: @{user.username or 'не указан'}")
            print(f"Имя: {user.first_name or ''} {user.last_name or ''}")
            print(f"Статус: {status}")
            print(f"Создан: {user.created_at}")
            print("-" * 80)
        
    finally:
        db.close()


def deactivate_user(telegram_id: int):
    """Деактивировать пользователя"""
    db = SessionLocal()
    
    try:
        user = db.query(models.User).filter(
            models.User.telegram_id == telegram_id
        ).first()
        
        if not user:
            print(f"❌ Пользователь с Telegram ID {telegram_id} не найден")
            return
        
        user.is_active = False
        db.commit()
        
        print(f"✅ Пользователь @{user.username or telegram_id} деактивирован")
        
    finally:
        db.close()


def main():
    """Главное меню"""
    print("=" * 80)
    print("  Управление пользователями IQOS Shop")
    print("=" * 80)
    print()
    print("1. Добавить пользователя")
    print("2. Показать всех пользователей")
    print("3. Деактивировать пользователя")
    print("4. Выход")
    print()
    
    choice = input("Выберите действие (1-4): ")
    
    if choice == "1":
        print("\n--- Добавление пользователя ---")
        print("Обязательно: Telegram ID")
        print("Опционально: username, имя, фамилия")
        print()
        
        telegram_id = input("Telegram ID: ")
        try:
            telegram_id = int(telegram_id)
        except:
            print("❌ Telegram ID должен быть числом")
            return
        
        username = input("Username (без @, Enter чтобы пропустить): ").strip() or None
        first_name = input("Имя (Enter чтобы пропустить): ").strip() or None
        last_name = input("Фамилия (Enter чтобы пропустить): ").strip() or None
        
        add_user(telegram_id, username, first_name, last_name)
        
    elif choice == "2":
        list_users()
        
    elif choice == "3":
        telegram_id = input("\nTelegram ID для деактивации: ")
        try:
            telegram_id = int(telegram_id)
            deactivate_user(telegram_id)
        except:
            print("❌ Telegram ID должен быть числом")
            
    elif choice == "4":
        print("👋 До свидания!")
        return
    else:
        print("❌ Неверный выбор")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Быстрое добавление через аргументы командной строки
        # python add_user.py 123456789 username "Иван" "Иванов"
        telegram_id = int(sys.argv[1])
        username = sys.argv[2] if len(sys.argv) > 2 else None
        first_name = sys.argv[3] if len(sys.argv) > 3 else None
        last_name = sys.argv[4] if len(sys.argv) > 4 else None
        
        add_user(telegram_id, username, first_name, last_name)
    else:
        main()
