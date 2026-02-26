"""
Atelier Matching Engine Service
ML-based matching of fashion designs with ateliers and tailors
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Atelier Matching Service",
    description="Matches fashion designs with ateliers and tailors",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AtelierRequest(BaseModel):
    imageUrl: str
    location: Optional[str] = None
    budget: Optional[float] = None
    max_results: int = 10

class Atelier(BaseModel):
    id: str
    name: str
    location: str
    specialization: List[str]
    priceRange: str
    rating: float
    portfolioImages: List[str]
    contact: Optional[dict] = None
    matchScore: float

class AtelierResponse(BaseModel):
    ateliers: List[Atelier]
    query_time: float
    total_matches: int

def extract_features(image_url: str) -> dict:
    """
    Extract features from fashion design image
    TODO: Use ML classifier to determine:
    - Category (dress, corset, suit, etc.)
    - Complexity level
    - Fabric type
    - Decorative elements
    """
    # Placeholder: Return mock features
    # In production:
    # 1. Load image
    # 2. Use ML classifier (CNN or Vision Transformer)
    # 3. Extract category, complexity, fabric, decorations
    # 4. Return structured features
    
    return {
        "category": "dress",
        "complexity": "medium",
        "fabric_type": "satin",
        "decorative_elements": ["embroidery", "beading"]
    }

def calculate_complexity_score(features: dict) -> float:
    """
    Calculate complexity score based on features
    """
    complexity_map = {
        "low": 0.3,
        "medium": 0.6,
        "high": 1.0
    }
    
    base_score = complexity_map.get(features.get("complexity", "medium"), 0.6)
    
    # Increase score for decorative elements
    decorative_bonus = len(features.get("decorative_elements", [])) * 0.1
    
    return min(1.0, base_score + decorative_bonus)

# Mock atelier database
# In production, this would be PostgreSQL or MongoDB
MOCK_ATELIERS = [
    {
        "id": "1",
        "name": "Ателье Элегант",
        "location": "Москва",
        "specialization": ["вечерние платья", "свадебные платья", "корсеты"],
        "priceRange": "20000-50000 руб",
        "rating": 4.8,
        "portfolioImages": [
            "https://via.placeholder.com/400x600/ec4899/ffffff?text=Portfolio+1",
            "https://via.placeholder.com/400x600/ec4899/ffffff?text=Portfolio+2",
            "https://via.placeholder.com/400x600/ec4899/ffffff?text=Portfolio+3"
        ],
        "contact": {
            "phone": "+7 (999) 123-45-67",
            "email": "atelier@example.com"
        },
        "complexity_range": ["low", "medium", "high"],
        "categories": ["dress", "corset"]
    },
    {
        "id": "2",
        "name": "Мастерская Стиль",
        "location": "Санкт-Петербург",
        "specialization": ["повседневная одежда", "офисная одежда"],
        "priceRange": "10000-30000 руб",
        "rating": 4.6,
        "portfolioImages": [
            "https://via.placeholder.com/400x600/ec4899/ffffff?text=Portfolio+1",
            "https://via.placeholder.com/400x600/ec4899/ffffff?text=Portfolio+2"
        ],
        "contact": {
            "phone": "+7 (812) 123-45-67",
            "email": "master@example.com"
        },
        "complexity_range": ["low", "medium"],
        "categories": ["dress", "suit"]
    },
    # Add more mock ateliers...
]

def match_atelier(features: dict, atelier: dict, location: Optional[str] = None, budget: Optional[float] = None) -> Optional[float]:
    """
    Calculate match score between design features and atelier capabilities
    """
    score = 0.0
    
    # Category match
    if features["category"] in atelier.get("categories", []):
        score += 0.4
    else:
        return None  # No match if category doesn't fit
    
    # Complexity match
    complexity = features.get("complexity", "medium")
    if complexity in atelier.get("complexity_range", []):
        score += 0.3
    
    # Location match (if specified)
    if location and location.lower() in atelier["location"].lower():
        score += 0.2
    
    # Budget match (if specified)
    if budget:
        # Parse price range (simplified)
        price_range = atelier["priceRange"]
        # In production, parse actual range and check if budget fits
        score += 0.1
    
    # Rating boost
    rating_boost = (atelier["rating"] - 3.0) / 2.0 * 0.1  # Normalize 3-5 to 0-0.1
    score += rating_boost
    
    return min(1.0, score)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "atelier-matching"}

@app.post("/match", response_model=AtelierResponse)
async def match_ateliers(request: AtelierRequest):
    """
    Find matching ateliers for custom fashion creation
    """
    try:
        start_time = datetime.now()
        
        # Extract features from image
        features = extract_features(request.imageUrl)
        logger.info(f"Extracted features: {features}")
        
        # Match with ateliers
        matched_ateliers = []
        
        for atelier in MOCK_ATELIERS:
            match_score = match_atelier(
                features,
                atelier,
                location=request.location,
                budget=request.budget
            )
            
            if match_score and match_score > 0.3:  # Minimum match threshold
                matched_ateliers.append({
                    **atelier,
                    "matchScore": match_score
                })
        
        # Sort by match score (descending)
        matched_ateliers.sort(key=lambda x: x["matchScore"], reverse=True)
        
        # Limit results
        results = matched_ateliers[:request.max_results]
        
        # Convert to Atelier models
        ateliers = [
            Atelier(
                id=a["id"],
                name=a["name"],
                location=a["location"],
                specialization=a["specialization"],
                priceRange=a["priceRange"],
                rating=a["rating"],
                portfolioImages=a["portfolioImages"],
                contact=a.get("contact"),
                matchScore=a["matchScore"]
            )
            for a in results
        ]
        
        query_time = (datetime.now() - start_time).total_seconds()
        
        return AtelierResponse(
            ateliers=ateliers,
            query_time=query_time,
            total_matches=len(matched_ateliers)
        )
    except Exception as e:
        logger.error(f"Atelier matching error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
