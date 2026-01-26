"""
Обновление типов категорий
"""
from sqlalchemy import create_engine, text
from config import settings

def update_types():
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        print("🔄 Обновление типов категорий...")
        
        # Категории устройств
        devices = ['IQOS ILUMA', 'IQOS 3 DUO', 'lil SOLID', 'Аксессуары']
        
        for category in devices:
            conn.execute(text(f"UPDATE categories SET type = 'devices' WHERE name = '{category}'"))
        
        # Категории стиков
        sticks = ['TEREA', 'HEETS', 'FIIT']
        
        for category in sticks:
            conn.execute(text(f"UPDATE categories SET type = 'sticks' WHERE name = '{category}'"))
        
        conn.commit()
        print("✅ Типы категорий обновлены")

if __name__ == "__main__":
    update_types()
