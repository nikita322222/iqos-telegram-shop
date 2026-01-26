"""
Перемещение категорий стиков в правильный тип
"""
from sqlalchemy import create_engine, text
from config import settings

def fix_categories():
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        print("🔄 Перемещение категорий стиков...")
        
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
        print("✅ Категории стиков перемещены")

if __name__ == "__main__":
    fix_categories()
