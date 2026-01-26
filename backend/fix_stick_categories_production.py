"""
Перемещение категорий стиков в правильный тип на PRODUCTION
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

def fix_categories():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("🔄 Перемещение категорий стиков на PRODUCTION...")
        
        # Категории стиков которые нужно переместить
        stick_categories = [
            'Terea eu/ind',
            'Terea kz',
            'Парламент ru',
            'Heets kz',
            'FiiT ru/kz',
            'Terea arm'
        ]
        
        for category in stick_categories:
            result = conn.execute(text(f"UPDATE categories SET type = 'sticks' WHERE name = '{category}'"))
            if result.rowcount > 0:
                print(f"  ✓ {category} → sticks")
            else:
                print(f"  ⚠️ {category} не найдена")
        
        conn.commit()
        print("✅ Категории стиков перемещены на PRODUCTION")

if __name__ == "__main__":
    fix_categories()
