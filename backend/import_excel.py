"""
Скрипт для импорта товаров из Excel файла
"""
import pandas as pd
from database import SessionLocal
import models


def import_products_from_excel(file_path: str):
    """
    Импорт товаров из Excel файла
    
    Формат Excel файла (ваш):
    | Категория | Название | Цена | Описание | Картинка | Рейтинг | Артикул | Вес | Новинка |
    """
    db = SessionLocal()
    
    try:
        # Читаем Excel файл
        df = pd.read_excel(file_path)
        
        print(f"📊 Найдено строк в файле: {len(df)}")
        print(f"📋 Колонки: {', '.join(df.columns)}")
        
        # Проверяем наличие необходимых колонок
        required_columns = ['Категория', 'Название', 'Цена']
        for col in required_columns:
            if col not in df.columns:
                raise ValueError(f"Отсутствует обязательная колонка: {col}")
        
        imported_count = 0
        updated_count = 0
        skipped_count = 0
        
        for index, row in df.iterrows():
            try:
                # Пропускаем строки без названия
                if pd.isna(row['Название']) or str(row['Название']).strip() == '':
                    skipped_count += 1
                    continue
                
                # Определяем бейдж
                badge = None
                if 'Новинка' in df.columns and not pd.isna(row['Новинка']):
                    if str(row['Новинка']).lower() in ['да', 'yes', '1', 'true', 'нов']:
                        badge = 'NEW'
                
                # Проверяем существует ли товар
                existing_product = db.query(models.Product).filter(
                    models.Product.name == str(row['Название']).strip()
                ).first()
                
                product_data = {
                    'name': str(row['Название']).strip(),
                    'description': str(row.get('Описание', '')).strip() if not pd.isna(row.get('Описание')) else '',
                    'price': float(row['Цена']) if not pd.isna(row['Цена']) else 0,
                    'category': str(row['Категория']).strip() if not pd.isna(row['Категория']) else 'Без категории',
                    'badge': badge,
                    'stock': 100,  # По умолчанию
                    'image_url': str(row.get('Картинка', '')).strip() if not pd.isna(row.get('Картинка')) else None,
                    'is_active': True
                }
                
                if existing_product:
                    # Обновляем существующий товар
                    for key, value in product_data.items():
                        setattr(existing_product, key, value)
                    updated_count += 1
                    print(f"✏️  Обновлен: {row['Название']}")
                else:
                    # Создаем новый товар
                    product = models.Product(**product_data)
                    db.add(product)
                    imported_count += 1
                    print(f"✅ Добавлен: {row['Название']}")
                    
            except Exception as e:
                print(f"⚠️  Ошибка в строке {index + 2}: {e}")
                skipped_count += 1
                continue
        
        db.commit()
        
        print(f"\n🎉 Импорт завершен!")
        print(f"   ✅ Добавлено новых товаров: {imported_count}")
        print(f"   ✏️  Обновлено товаров: {updated_count}")
        print(f"   ⚠️  Пропущено строк: {skipped_count}")
        print(f"   📊 Всего обработано: {imported_count + updated_count}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка импорта: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def export_products_to_excel(file_path: str = "products_export.xlsx"):
    """Экспорт всех товаров в Excel файл"""
    db = SessionLocal()
    
    try:
        products = db.query(models.Product).all()
        
        data = []
        for product in products:
            data.append({
                'Категория': product.category,
                'Название': product.name,
                'Цена': product.price,
                'Описание': product.description,
                'Картинка': product.image_url,
                'Бейдж': product.badge,
                'Остаток': product.stock,
                'Активен': product.is_active
            })
        
        df = pd.DataFrame(data)
        df.to_excel(file_path, index=False)
        
        print(f"✅ Экспортировано {len(products)} товаров в {file_path}")
        
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Использование:")
        print("  Импорт: python import_excel.py import products.xlsx")
        print("  Экспорт: python import_excel.py export [products.xlsx]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "import":
        if len(sys.argv) < 3:
            print("❌ Укажите путь к Excel файлу")
            sys.exit(1)
        import_products_from_excel(sys.argv[2])
    
    elif command == "export":
        file_path = sys.argv[2] if len(sys.argv) > 2 else "products_export.xlsx"
        export_products_to_excel(file_path)
    
    else:
        print(f"❌ Неизвестная команда: {command}")
        print("Доступные команды: import, export")
