"""
User Database Schema
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

class SavedDesign(BaseModel):
    id: str
    image_url: str
    prompt: str
    created_at: datetime = Field(default_factory=datetime.now)

class User(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    saved_designs: List[SavedDesign] = []
    preferences: dict = {}
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
