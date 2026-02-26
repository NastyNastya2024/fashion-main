"""
Fashion Search Engine Service
Vector similarity search for products using CLIP-like vision encoders
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
import numpy as np
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Fashion Search Engine",
    description="Vector similarity search for fashion products",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    imageUrl: str
    max_results: int = 20
    min_similarity: float = 0.7
    budget_filter: Optional[float] = None

class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float
    image: str
    url: str
    brand: Optional[str] = None
    rating: Optional[float] = None
    similarity: float
    availability: bool = True

class SearchResponse(BaseModel):
    products: List[Product]
    query_time: float
    total_matches: int

# Placeholder for vision encoder
# In production, this would use CLIP, OpenCLIP, or custom fine-tuned model
def encode_image(image_url: str) -> np.ndarray:
    """
    Encode image to vector embedding using vision encoder
    TODO: Integrate with CLIP or similar vision encoder
    """
    # Placeholder: Return random embedding
    # In production:
    # 1. Download image from URL
    # 2. Preprocess image (resize, normalize)
    # 3. Pass through vision encoder (CLIP)
    # 4. Return embedding vector (512-1024 dimensions)
    
    return np.random.rand(512).astype(np.float32)

def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Calculate cosine similarity between two vectors"""
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    return dot_product / (norm1 * norm2) if norm1 > 0 and norm2 > 0 else 0.0

def calculate_product_score(
    similarity: float,
    price: float,
    budget: Optional[float],
    brand_score: float = 0.5,
    availability: bool = True
) -> float:
    """
    Calculate final product score using ranking formula:
    score = α * cosine_similarity + β * price_alignment + γ * brand_score + δ * availability
    """
    alpha = 0.6  # Similarity weight
    beta = 0.2   # Price alignment weight
    gamma = 0.1  # Brand score weight
    delta = 0.1  # Availability weight
    
    # Price alignment (closer to budget = higher score)
    if budget:
        price_diff = abs(price - budget) / budget
        price_alignment = max(0, 1 - price_diff)
    else:
        price_alignment = 0.5
    
    # Availability score
    availability_score = 1.0 if availability else 0.0
    
    score = (
        alpha * similarity +
        beta * price_alignment +
        gamma * brand_score +
        delta * availability_score
    )
    
    return score

# Mock product database
# In production, this would be a vector database (Pinecone, Weaviate, Qdrant)
MOCK_PRODUCTS = [
    {
        "id": "1",
        "name": "Элегантное вечернее платье",
        "category": "dress",
        "price": 15000.0,
        "image": "https://via.placeholder.com/400x600/ec4899/ffffff?text=Dress+1",
        "url": "https://example.com/product/1",
        "brand": "Fashion Brand",
        "rating": 4.5,
        "embedding": np.random.rand(512).astype(np.float32),
        "availability": True
    },
    # Add more mock products...
]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "search-engine"}

@app.post("/search", response_model=SearchResponse)
async def search_products(request: SearchRequest):
    """
    Search for similar products using image vector similarity
    """
    try:
        start_time = datetime.now()
        
        # Encode query image
        query_embedding = encode_image(request.imageUrl)
        logger.info(f"Encoded query image, embedding shape: {query_embedding.shape}")
        
        # Calculate similarities
        scored_products = []
        
        for product in MOCK_PRODUCTS:
            similarity = cosine_similarity(query_embedding, product["embedding"])
            
            if similarity >= request.min_similarity:
                score = calculate_product_score(
                    similarity=similarity,
                    price=product["price"],
                    budget=request.budget_filter,
                    brand_score=0.5,
                    availability=product["availability"]
                )
                
                scored_products.append({
                    **product,
                    "similarity": similarity,
                    "score": score
                })
        
        # Sort by score (descending)
        scored_products.sort(key=lambda x: x["score"], reverse=True)
        
        # Limit results
        results = scored_products[:request.max_results]
        
        # Convert to Product models
        products = [
            Product(
                id=p["id"],
                name=p["name"],
                category=p["category"],
                price=p["price"],
                image=p["image"],
                url=p["url"],
                brand=p.get("brand"),
                rating=p.get("rating"),
                similarity=p["similarity"],
                availability=p["availability"]
            )
            for p in results
        ]
        
        query_time = (datetime.now() - start_time).total_seconds()
        
        return SearchResponse(
            products=products,
            query_time=query_time,
            total_matches=len(scored_products)
        )
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
