"""
Обновление типов категорий на PRODUCTION
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"

def update_types():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("🔄 Обновление типов категорий на PRODUCTION...")
        
        # Категории устройств
        devices = ['IQOS ILUMA', 'IQOS 3 DUO', 'lil SOLID', 'Аксессуары']
        
        for category in devices:
            conn.execute(text(f"UPDATE categories SET type = 'devices' WHERE name = '{category}'"))
            print(f"  ✓ {category} → devices")
        
        # Категории стиков
        sticks = ['TEREA', 'HEETS', 'FIIT']
        
        for category in sticks:
            conn.execute(text(f"UPDATE categories SET type = 'sticks' WHERE name = '{category}'"))
            print(f"  ✓ {category} → sticks")
        
        conn.commit()
        print("✅ Типы категорий обновлены на PRODUCTION")

if __name__ == "__main__":
    update_types()
