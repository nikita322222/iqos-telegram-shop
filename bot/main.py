import asyncio
import logging
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
import aiohttp

import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(token=config.BOT_TOKEN)
dp = Dispatcher()


async def check_user_access(telegram_id: int) -> bool:
    """Проверка доступа пользователя через Backend API"""
    try:
        async with aiohttp.ClientSession() as session:
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


async def notify_admin(order_data: dict):
    """Отправка уведомления администратору о новом заказе"""
    if not config.ADMIN_TELEGRAM_ID:
        return
    
    try:
        message_text = (
            "🔔 <b>Новый заказ!</b>\n\n"
            f"👤 Клиент: {order_data.get('username', 'Неизвестно')}\n"
            f"📦 Заказ №{order_data.get('order_id')}\n"
            f"💰 Сумма: {order_data.get('total_amount')} руб.\n"
            f"📝 Товаров: {order_data.get('items_count')}\n"
        )
        
        await bot.send_message(
            chat_id=config.ADMIN_TELEGRAM_ID,
            text=message_text,
            parse_mode="HTML"
        )
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления админу: {e}")


async def main():
    """Запуск бота"""
    logger.info("Бот запущен")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
