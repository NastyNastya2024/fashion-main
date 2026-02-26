"""
Atelier Database Schema
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

class ContactInfo(BaseModel):
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    instagram: Optional[str] = None

class Atelier(BaseModel):
    id: str
    name: str
    location: str
    specialization: List[str]  # ["вечерние платья", "корсеты", etc.]
    priceRange: str  # "20000-50000 руб"
    rating: float = Field(ge=0, le=5)
    portfolioImages: List[str]
    contact: Optional[ContactInfo] = None
    complexity_range: List[str] = ["low", "medium", "high"]
    categories: List[str] = []  # ["dress", "corset", etc.]
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class AtelierCreate(BaseModel):
    name: str
    location: str
    specialization: List[str]
    priceRange: str
    portfolioImages: List[str]
    contact: Optional[ContactInfo] = None
    complexity_range: List[str] = ["low", "medium", "high"]
    categories: List[str] = []
