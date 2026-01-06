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
    delivery_address: Optional[str] = None
    phone: Optional[str] = None
    comment: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class Order(OrderBase):
    id: int
    user_id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItem]
    
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
