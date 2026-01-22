"""
Скрипт для исправления URL изображений товаров IQOS LIL SOLID DUAL
"""
import psycopg2

def fix_images():
    """Исправляет URL изображений для товаров IQOS LIL SOLID DUAL"""
    
    # Production PostgreSQL URL
    DATABASE_URL = "postgresql://iqos_shop_user:uTkPZCY7H2XxaTjV2SQge7jyJw4eqbjF@dpg-d5jn3dvfte5s738pe2dg-a.frankfurt-postgres.render.com/iqos_shop"
    
    # Подключаемся к production базе
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        # Обновляем URL изображений
        updates = [
            (66, 'https://cdn.ibot.by/shop/2777/item493790-3.webp'),
            (116, 'https://cdn.ibot.by/shop/2777/item1267779.webp'),
            (117, 'https://cdn.ibot.by/shop/2777/item1267780.webp'),
            (118, 'https://cdn.ibot.by/shop/2777/item1267781.webp'),
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
