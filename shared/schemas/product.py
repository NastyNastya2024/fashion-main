"""
Product Database Schema
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class Product(BaseModel):
    id: str
    name: str
    category: str  # dress, suit, corset, etc.
    price: float
    image: str
    url: str
    brand: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    embedding: Optional[List[float]] = None  # Vector embedding
    availability: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    image: str
    url: str
    brand: Optional[str] = None
    rating: Optional[float] = None
    embedding: Optional[List[float]] = None
    availability: bool = True
