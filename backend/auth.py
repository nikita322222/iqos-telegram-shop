import hmac
import hashlib
from urllib.parse import parse_qsl
from fastapi import HTTPException, Header
from typing import Optional
from config import settings


def verify_telegram_init_data(init_data: str) -> dict:
    """
    Проверка подписи Telegram initData (HMAC SHA-256)
    Возвращает данные пользователя если подпись валидна
    """
    try:
        # Парсим данные
        parsed_data = dict(parse_qsl(init_data))
        
        # Извлекаем hash
        received_hash = parsed_data.pop('hash', None)
        if not received_hash:
            raise HTTPException(status_code=401, detail="Hash отсутствует")
        
        # Создаем строку для проверки
        data_check_string = '\n'.join(
            f"{k}={v}" for k, v in sorted(parsed_data.items())
        )
        
        # Создаем секретный ключ
        secret_key = hmac.new(
            key=b"WebAppData",
            msg=settings.bot_token.encode(),
            digestmod=hashlib.sha256
        ).digest()
        
        # Вычисляем hash
        calculated_hash = hmac.new(
            key=secret_key,
            msg=data_check_string.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        # Сравниваем
        if not hmac.compare_digest(calculated_hash, received_hash):
            raise HTTPException(status_code=401, detail="Неверная подпись")
        
        return parsed_data
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Ошибка проверки: {str(e)}")


async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Dependency для получения текущего пользователя из Telegram initData
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header отсутствует")
    
    # Убираем префикс "tma " если есть
    init_data = authorization.replace("tma ", "")
    
    # Проверяем подпись
    user_data = verify_telegram_init_data(init_data)
    
    # Извлекаем данные пользователя
    import json
    user_info = json.loads(user_data.get('user', '{}'))
    
    return {
        'telegram_id': user_info.get('id'),
        'username': user_info.get('username'),
        'first_name': user_info.get('first_name'),
        'last_name': user_info.get('last_name')
    }
