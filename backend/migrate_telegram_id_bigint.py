"""
Миграция: Изменение типа telegram_id с Integer на BigInteger
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Production database URL
DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def migrate():
    db = SessionLocal()
    
    try:
        print("🔄 Изменение типа telegram_id на BIGINT...")
        
        # Изменяем тип поля telegram_id на BIGINT
        db.execute(text("""
            ALTER TABLE users 
            ALTER COLUMN telegram_id TYPE BIGINT
        """))
        
        db.commit()
        print("✅ Тип telegram_id успешно изменен на BIGINT")
        
    except Exception as e:
        print(f"❌ Ошибка миграции: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Запуск миграции telegram_id -> BIGINT...")
    migrate()
    print("✅ Миграция завершена")
