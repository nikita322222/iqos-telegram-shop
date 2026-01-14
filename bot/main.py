import asyncio
import logging
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, WebAppInfo, CallbackQuery
from aiogram.utils.keyboard import InlineKeyboardBuilder
import aiohttp

import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(token=config.BOT_TOKEN)
dp = Dispatcher()

# Хранилище обработанных заказов
processed_orders = set()


async def check_user_access(telegram_id: int) -> bool:
    """Проверка доступа пользователя через Backend API"""
    try:
        import ssl
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.get(
                f"{config.BACKEND_URL}/api/users/check/{telegram_id}"
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("has_access", False)
                return False
    except Exception as e:
        logger.error(f"Ошибка проверки доступа: {e}")
        return False


@dp.message(CommandStart())
async def cmd_start(message: Message):
    """Обработчик команды /start"""
    telegram_id = message.from_user.id
    username = message.from_user.username or "Пользователь"
    
    # Проверяем доступ пользователя
    has_access = await check_user_access(telegram_id)
    
    if not has_access:
        await message.answer(
            "🔒 <b>Доступ ограничен</b>\n\n"
            "Этот магазин доступен только для авторизованных клиентов.\n"
            "Если вы считаете, что это ошибка, обратитесь к администратору.",
            parse_mode="HTML"
        )
        return
    
    # Создаем кнопку для открытия Mini App
    builder = InlineKeyboardBuilder()
    builder.button(
        text="🛍 Открыть магазин",
        web_app=WebAppInfo(url=config.MINI_APP_URL)
    )
    
    await message.answer(
        f"👋 Добро пожаловать, {username}!\n\n"
        "🎯 <b>IQOS Online Store</b>\n\n"
        "Нажмите кнопку ниже, чтобы открыть магазин:",
        reply_markup=builder.as_markup(),
        parse_mode="HTML"
    )


async def check_new_orders():
    """Периодическая проверка новых заказов"""
    while True:
        try:
            import ssl
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            connector = aiohttp.TCPConnector(ssl=ssl_context)
            async with aiohttp.ClientSession(connector=connector) as session:
                # Получаем все заказы со статусом pending
                async with session.get(
                    f"{config.BACKEND_URL}/api/admin/orders/pending"
                ) as response:
                    if response.status == 200:
                        orders = await response.json()
                        
                        for order in orders:
                            order_id = order.get('id')
                            
                            # Пропускаем уже обработанные заказы
                            if order_id in processed_orders:
                                continue
                            
                            # Отправляем уведомление
                            await send_order_notification(order)
                            
                            # Добавляем в обработанные
                            processed_orders.add(order_id)
                            
        except Exception as e:
            logger.error(f"Ошибка проверки заказов: {e}")
        
        # Проверяем каждые 10 секунд
        await asyncio.sleep(10)


async def send_order_notification(order_data: dict):
    """Отправка уведомления о новом заказе в группу администраторов"""
    if not config.ADMIN_GROUP_ID:
        logger.warning("ADMIN_GROUP_ID не установлен, уведомление не отправлено")
        return
    
    try:
        # Формируем текст уведомления
        order_id = order_data.get('id')
        delivery_type = order_data.get('delivery_type')
        
        message_text = (
            "🔔 <b>НОВЫЙ ЗАКАЗ</b>\n\n"
            f"📋 <b>Заказ №{order_id}</b>\n"
            f"👤 <b>Клиент:</b> {order_data.get('full_name')}\n"
            f"📱 <b>Телефон:</b> {order_data.get('phone')}\n"
            f"💰 <b>Сумма:</b> {order_data.get('total_amount')} BYN\n"
            f"💳 <b>Оплата:</b> {'Наличные' if order_data.get('payment_method') == 'cash' else 'USDT'}\n\n"
        )
        
        # Добавляем информацию о доставке
        if delivery_type == 'minsk':
            message_text += (
                "🚚 <b>Доставка по Минску</b>\n"
                f"📍 <b>Адрес:</b> {order_data.get('delivery_address')}\n"
                f"🕐 <b>Время:</b> {order_data.get('delivery_time')}\n"
            )
            if order_data.get('delivery_date'):
                message_text += f"📅 <b>Дата:</b> {order_data.get('delivery_date')}\n"
        elif delivery_type == 'europost':
            message_text += (
                "📦 <b>Евро почта</b>\n"
                f"🏙 <b>Город:</b> {order_data.get('city')}\n"
                f"🏢 <b>Отделение:</b> {order_data.get('europost_office')}\n"
            )
            if order_data.get('delivery_date'):
                message_text += f"📅 <b>Дата:</b> {order_data.get('delivery_date')}\n"
        
        # Добавляем комментарий если есть
        if order_data.get('comment'):
            message_text += f"\n💬 <b>Комментарий:</b> {order_data.get('comment')}\n"
        
        # Добавляем список товаров
        items = order_data.get('items', [])
        if items:
            message_text += "\n📦 <b>Товары:</b>\n"
            for item in items:
                product = item.get('product', {})
                message_text += f"  • {product.get('name')} x{item.get('quantity')} = {item.get('price') * item.get('quantity')} BYN\n"
        
        # Создаем кнопки для принятия/отклонения заказа
        builder = InlineKeyboardBuilder()
        builder.button(
            text="✅ Принять заказ",
            callback_data=f"order_accept_{order_id}"
        )
        builder.button(
            text="❌ Отклонить заказ",
            callback_data=f"order_reject_{order_id}"
        )
        builder.adjust(2)  # 2 кнопки в ряд
        
        # Отправляем уведомление в группу
        await bot.send_message(
            chat_id=config.ADMIN_GROUP_ID,
            text=message_text,
            reply_markup=builder.as_markup(),
            parse_mode="HTML"
        )
        
        logger.info(f"Уведомление о заказе #{order_id} отправлено в группу")
        
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления о заказе: {e}")


@dp.callback_query(F.data.startswith("order_accept_"))
async def handle_order_accept(callback: CallbackQuery):
    """Обработчик принятия заказа"""
    order_id = callback.data.split("_")[-1]
    
    try:
        # Обновляем статус заказа через API
        import ssl
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.patch(
                f"{config.BACKEND_URL}/api/orders/{order_id}/status",
                json={"status": "confirmed"}
            ) as response:
                if response.status == 200:
                    # Обновляем сообщение
                    new_text = callback.message.text + f"\n\n✅ <b>Заказ принят</b> (@{callback.from_user.username})"
                    await callback.message.edit_text(
                        text=new_text,
                        parse_mode="HTML"
                    )
                    await callback.answer("✅ Заказ принят!", show_alert=True)
                else:
                    await callback.answer("❌ Ошибка обновления статуса", show_alert=True)
    except Exception as e:
        logger.error(f"Ошибка принятия заказа: {e}")
        await callback.answer("❌ Ошибка обработки", show_alert=True)


@dp.callback_query(F.data.startswith("order_reject_"))
async def handle_order_reject(callback: CallbackQuery):
    """Обработчик отклонения заказа"""
    order_id = callback.data.split("_")[-1]
    
    try:
        # Обновляем статус заказа через API
        import ssl
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        async with aiohttp.ClientSession(connector=connector) as session:
            async with session.patch(
                f"{config.BACKEND_URL}/api/orders/{order_id}/status",
                json={"status": "cancelled"}
            ) as response:
                if response.status == 200:
                    # Обновляем сообщение
                    new_text = callback.message.text + f"\n\n❌ <b>Заказ отклонен</b> (@{callback.from_user.username})"
                    await callback.message.edit_text(
                        text=new_text,
                        parse_mode="HTML"
                    )
                    await callback.answer("❌ Заказ отклонен", show_alert=True)
                else:
                    await callback.answer("❌ Ошибка обновления статуса", show_alert=True)
    except Exception as e:
        logger.error(f"Ошибка отклонения заказа: {e}")
        await callback.answer("❌ Ошибка обработки", show_alert=True)


async def main():
    """Запуск бота"""
    logger.info("Бот запущен")
    
    # Запускаем проверку заказов в фоне
    asyncio.create_task(check_new_orders())
    logger.info("Запущена проверка новых заказов")
    
    # Запускаем polling
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
