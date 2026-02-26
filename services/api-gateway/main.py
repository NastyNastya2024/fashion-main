"""
API Gateway for StyleGenie
Routes requests to appropriate microservices
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="StyleGenie API Gateway",
    description="API Gateway for StyleGenie fashion application",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs (from environment or defaults)
IMAGE_GENERATION_SERVICE = os.getenv("IMAGE_GENERATION_SERVICE", "http://localhost:8001")
SEARCH_ENGINE_SERVICE = os.getenv("SEARCH_ENGINE_SERVICE", "http://localhost:8002")
ATELIER_MATCHING_SERVICE = os.getenv("ATELIER_MATCHING_SERVICE", "http://localhost:8003")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "api-gateway"}

@app.post("/api/v1/generate")
async def generate_images(request: Request):
    """
    Generate fashion images from text prompt
    Forwards to Image Generation Service
    """
    try:
        body = await request.json()
        logger.info(f"Generating images with prompt: {body.get('prompt', '')[:50]}...")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{IMAGE_GENERATION_SERVICE}/generate",
                json=body
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Image generation service error: {e}")
        raise HTTPException(status_code=503, detail="Image generation service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/search")
async def search_products(request: Request):
    """
    Search for similar products using image
    Forwards to Search Engine Service
    """
    try:
        body = await request.json()
        logger.info("Searching for similar products")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{SEARCH_ENGINE_SERVICE}/search",
                json=body
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Search engine service error: {e}")
        raise HTTPException(status_code=503, detail="Search engine service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ateliers")
async def find_ateliers(request: Request):
    """
    Find matching ateliers for custom creation
    Forwards to Atelier Matching Service
    """
    try:
        body = await request.json()
        logger.info("Finding matching ateliers")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{ATELIER_MATCHING_SERVICE}/match",
                json=body
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Atelier matching service error: {e}")
        raise HTTPException(status_code=503, detail="Atelier matching service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
