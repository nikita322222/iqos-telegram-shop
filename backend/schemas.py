from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class UserBase(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    saved_full_name: Optional[str] = None
    saved_phone: Optional[str] = None
    saved_delivery_address: Optional[str] = None
    saved_city: Optional[str] = None
    saved_europost_office: Optional[str] = None
    saved_delivery_type: Optional[str] = None
    bonus_balance: float = 0.0
    total_orders_count: int = 0
    loyalty_level: str = "bronze"
    
    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None
    badge: Optional[str] = None
    stock: int = 0


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int


class OrderItemCreate(OrderItemBase):
    pass


class OrderItem(OrderItemBase):
    id: int
    price: float
    product: Product
    
    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    delivery_type: str  # minsk, europost
    full_name: str
    phone: str
    payment_method: str  # cash, usdt
    
    # Доставка по Минску
    delivery_address: Optional[str] = None
    delivery_time: Optional[str] = None
    delivery_date: Optional[str] = None
    
    # Евро почта
    city: Optional[str] = None
    europost_office: Optional[str] = None
    
    comment: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]
    bonus_to_use: Optional[float] = 0.0  # Сколько бонусов хочет использовать


class Order(OrderBase):
    id: int
    user_id: int
    total_amount: float
    delivery_cost: float = 0.0
    bonus_used: float = 0.0
    bonus_earned: float = 0.0
    status: str
    created_at: datetime
    items: List[OrderItem]
    user: User
    
    class Config:
        from_attributes = True


class BonusTransactionBase(BaseModel):
    amount: float
    transaction_type: str
    description: Optional[str] = None


class BonusTransaction(BonusTransactionBase):
    id: int
    user_id: int
    order_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class FavoriteCreate(BaseModel):
    product_id: int


class Favorite(BaseModel):
    id: int
    user_id: int
    product_id: int
    product: Product
    created_at: datetime
    
    class Config:
        from_attributes = True


class SavedAddressBase(BaseModel):
    name: str
    delivery_type: str  # minsk, europost
    address: Optional[str] = None
    city: Optional[str] = None
    europost_office: Optional[str] = None
    is_default: bool = False


class SavedAddressCreate(SavedAddressBase):
    pass


class SavedAddress(SavedAddressBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class BonusInfo(BaseModel):
    """Информация о бонусной системе пользователя"""
    bonus_balance: float
    total_orders_count: int
    loyalty_level: str
    cashback_percent: float
    next_level_orders: Optional[int] = None
    progress_percent: float


class BroadcastCreate(BaseModel):
    """Создание рассылки"""
    message: str
    send_immediately: bool = True
    scheduled_time: Optional[datetime] = None
    repeat_enabled: bool = False
    repeat_interval_hours: Optional[int] = None
    max_repeats: Optional[int] = None


class Broadcast(BaseModel):
    """Рассылка"""
    id: int
    message: str
    status: str
    send_immediately: bool
    scheduled_time: Optional[datetime] = None
    repeat_enabled: bool
    repeat_interval_hours: Optional[int] = None
    repeat_count: int
    max_repeats: Optional[int] = None
    last_sent_at: Optional[datetime] = None
    total_recipients: int
    sent_count: int
    failed_count: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
