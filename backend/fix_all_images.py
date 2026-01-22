"""
Скрипт для исправления всех URL изображений с множественными ссылками
"""
import psycopg2

def fix_images():
    """Исправляет URL изображений для всех товаров с проблемными ссылками"""
    
    # Production PostgreSQL URL
    DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        # Обновляем URL изображений
        updates = [
            (104, 'https://cdn.ibot.by/shop/2777/item1192593.webp'),
            (105, 'https://cdn.ibot.by/shop/2777/item1192832.webp'),
            (106, 'https://cdn.ibot.by/shop/2777/item1192833.webp'),
            (114, 'https://cdn.ibot.by/shop/2777/item1252244.webp'),
        ]
        
        for product_id, image_url in updates:
            cursor.execute(
                "UPDATE products SET image_url = %s WHERE id = %s",
                (image_url, product_id)
            )
            print(f"✅ Обновлен товар ID {product_id}")
        
        conn.commit()
        print("\n✅ Все изображения успешно обновлены!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Ошибка: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    fix_images()
