"""
Скрипт для загрузки товаров на продакшн сервер
"""
import requests
from database import SessionLocal
import models

PRODUCTION_URL = "https://iqos-backend.onrender.com"

def upload_products_to_production():
    """Загрузка всех товаров из локальной БД на продакшн"""
    db = SessionLocal()
    
    try:
        # Получаем все товары из локальной БД
        products = db.query(models.Product).all()
        
        print(f"📦 Найдено товаров в локальной БД: {len(products)}")
        
        # Формируем данные для отправки
        products_data = []
        for product in products:
            products_data.append({
                "name": product.name,
                "description": product.description or "",
                "price": product.price,
                "image_url": product.image_url,
                "category": product.category,
                "badge": product.badge,
                "stock": product.stock
            })
        
        # Отправляем на продакшн
        print(f"🚀 Отправка товаров на {PRODUCTION_URL}...")
        
        response = requests.post(
            f"{PRODUCTION_URL}/api/admin/import-products",
            json=products_data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Успешно загружено!")
            print(f"   Добавлено новых: {result['imported']}")
            print(f"   Обновлено: {result['updated']}")
            print(f"   Всего: {result['total']}")
        else:
            print(f"❌ Ошибка: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Ошибка загрузки: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    print("🔄 Загрузка товаров на продакшн сервер...")
    upload_products_to_production()
