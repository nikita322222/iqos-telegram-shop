"""
Webhook сервер для приема уведомлений о заказах от backend
"""
from aiohttp import web
import asyncio
import logging
from main import bot, send_order_notification
import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def handle_order_webhook(request):
    """Обработчик webhook для новых заказов"""
    try:
        order_data = await request.json()
        logger.info(f"Получен заказ #{order_data.get('order_id')}")
        
        # Отправляем уведомление в группу
        await send_order_notification(order_data)
        
        return web.json_response({"status": "ok"})
    except Exception as e:
        logger.error(f"Ошибка обработки webhook: {e}")
        return web.json_response({"status": "error", "message": str(e)}, status=500)


async def start_webhook_server():
    """Запуск webhook сервера"""
    app = web.Application()
    app.router.add_post('/webhook/order', handle_order_webhook)
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', 8001)
    await site.start()
    
    logger.info("Webhook сервер запущен на порту 8001")


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_webhook_server())
    loop.run_forever()
