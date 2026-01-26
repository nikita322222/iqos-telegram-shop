from database import SessionLocal
import models

db = SessionLocal()
orders = db.query(models.Order).limit(3).all()

if orders:
    for order in orders:
        print(f'\n=== Заказ #{order.id} ===')
        print(f'Статус: {order.status}')
        print(f'Сумма: {order.total_amount} BYN')
        print(f'Товаров в заказе: {len(order.items)}')
        
        if order.items:
            for item in order.items:
                print(f'  - {item.product.name} x {item.quantity} = {item.price * item.quantity} BYN')
        else:
            print('  (нет товаров)')
        
        if order.user:
            print(f'Клиент: {order.user.username or order.user.first_name}')
        else:
            print('Клиент: не найден')
else:
    print('Нет заказов в базе')

db.close()
