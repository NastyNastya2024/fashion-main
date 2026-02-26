# Architecture Documentation

## System Overview

StyleGenie is built as a microservices architecture with the following components:

```
┌─────────────────┐
│   Next.js App   │ (Frontend)
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  API Gateway    │ (Port 8000)
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
    ▼         ▼              ▼              ▼
┌────────┐ ┌────────┐  ┌──────────┐  ┌──────────┐
│ Image  │ │Search  │  │ Atelier  │  │ Database │
│Generation│ │Engine │  │ Matching │  │ (Postgres)│
│(8001)  │ │(8002)  │  │  (8003)  │  │          │
└────────┘ └────────┘  └──────────┘  └──────────┘
    │         │              │
    │         │              │
    ▼         ▼              ▼
┌────────┐ ┌────────┐  ┌──────────┐
│  AI    │ │Vector  │  │   ML     │
│ Models │ │   DB   │  │Classifier│
└────────┘ └────────┘  └──────────┘
```

## Service Details

### 1. API Gateway (`services/api-gateway`)

**Responsibilities:**
- Route requests to appropriate microservices
- Handle CORS
- Request/response transformation
- Rate limiting (future)
- Authentication (future)

**Endpoints:**
- `POST /api/v1/generate` → Image Generation Service
- `POST /api/v1/search` → Search Engine Service
- `POST /api/v1/ateliers` → Atelier Matching Service

### 2. Image Generation Service (`services/image-generation`)

**Responsibilities:**
- Process text prompts
- Enhance prompts with fashion context
- Generate images using AI models
- Handle seed management for reproducibility
- Upload generated images to S3/CDN

**Pipeline:**
```
User Prompt → Prompt Enhancement → AI Model → Image Post-processing → Storage → URL Return
```

**Technologies:**
- Stable Diffusion XL / Flux
- ControlNet (for composition control)
- Replicate / HuggingFace APIs

### 3. Search Engine Service (`services/search-engine`)

**Responsibilities:**
- Encode images to vectors using CLIP
- Perform vector similarity search
- Rank products by multiple factors
- Filter by budget, availability, etc.

**Pipeline:**
```
Image → Vision Encoder → Embedding → Vector Search → Ranking → Product Results
```

**Ranking Formula:**
```
score = α * cosine_similarity 
      + β * price_alignment 
      + γ * brand_score 
      + δ * availability
```

**Technologies:**
- CLIP (OpenAI) or OpenCLIP
- Pinecone / Weaviate / Qdrant
- NumPy for vector operations

### 4. Atelier Matching Service (`services/atelier-matching`)

**Responsibilities:**
- Extract features from fashion designs
- Classify complexity and category
- Match with atelier capabilities
- Filter by location and budget

**Pipeline:**
```
Image → Feature Extraction → ML Classification → Atelier Matching → Results
```

**Technologies:**
- Vision Transformer / CNN for classification
- PostgreSQL for atelier database
- Scikit-learn for matching algorithms

## Data Flow

### Image Generation Flow

1. User submits prompt via frontend
2. Frontend sends request to API Gateway
3. API Gateway forwards to Image Generation Service
4. Service enhances prompt with fashion context
5. Service calls AI model API (Replicate/HuggingFace)
6. Generated images uploaded to S3
7. URLs returned to frontend

### Product Search Flow

1. User selects generated image
2. Frontend sends image URL to API Gateway
3. API Gateway forwards to Search Engine Service
4. Service encodes image using CLIP
5. Service queries vector database
6. Results ranked and filtered
7. Products returned to frontend

### Atelier Matching Flow

1. No products found OR user requests atelier
2. Frontend sends image URL to API Gateway
3. API Gateway forwards to Atelier Matching Service
4. Service extracts design features
5. Service queries atelier database
6. Results matched and scored
7. Ateliers returned to frontend

## Database Schema

### Products
- Stored in vector database (Pinecone/Weaviate)
- Metadata in PostgreSQL
- Embeddings updated when products added

### Ateliers
- Stored in PostgreSQL
- Portfolio images in S3
- Contact info encrypted

### Users
- Stored in PostgreSQL
- Saved designs as JSONB
- Preferences as JSONB

## Scalability Considerations

### Horizontal Scaling
- Each service can be scaled independently
- Stateless services enable easy replication
- Load balancer in front of API Gateway

### Caching Strategy
- Redis for frequently accessed data
- CDN for generated images
- Cache popular product searches

### Performance Targets
- Image generation: < 5 seconds
- Product search: < 1 second
- Atelier matching: < 2 seconds

## Security

### Authentication (Future)
- JWT tokens for user authentication
- API keys for service-to-service communication
- OAuth for third-party integrations

### Data Protection
- Encrypt sensitive user data
- Secure API endpoints
- Rate limiting to prevent abuse

### Image Moderation
- Content moderation for generated images
- Filter inappropriate content
- User reporting system

## Monitoring & Logging

### Metrics
- Request latency
- Error rates
- Service health
- AI model performance

### Logging
- Structured logging (JSON)
- Centralized log aggregation
- Error tracking (Sentry)

## Future Enhancements

1. **User Authentication & Profiles**
2. **Payment Integration**
3. **Real-time Notifications**
4. **Advanced AI Features** (inpainting, style transfer)
5. **Mobile App** (React Native)
6. **Admin Dashboard**
7. **Analytics & Insights**
