# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose (optional)
- PostgreSQL (optional, for production)

## Quick Start

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fashion.git
cd fashion
```

2. Copy environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Start all services:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Local Development

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000

#### Backend Services

1. Create virtual environments for each service:
```bash
cd services/api-gateway
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

2. Repeat for other services:
- `services/image-generation` (port 8001)
- `services/search-engine` (port 8002)
- `services/atelier-matching` (port 8003)

Or use the Makefile:
```bash
make dev-backend
```

## Configuration

### Environment Variables

Create `.env` files in each service directory or use the root `.env.example`:

**API Keys Required:**
- `REPLICATE_API_TOKEN` or `HUGGINGFACE_API_TOKEN` - For image generation
- `PINECONE_API_KEY` or `WEAVIATE_URL` - For vector search
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` - For image storage

**Database:**
- `DATABASE_URL` - PostgreSQL connection string

### AI Model Setup

1. **Image Generation:**
   - Sign up at [Replicate](https://replicate.com) or [HuggingFace](https://huggingface.co)
   - Get API token
   - Add to `.env` file

2. **Vision Encoder:**
   - Install PyTorch: `pip install torch torchvision`
   - Install CLIP: `pip install git+https://github.com/openai/CLIP.git`
   - Models will download automatically on first use

3. **Vector Database:**
   - Sign up at [Pinecone](https://www.pinecone.io) or run [Weaviate](https://weaviate.io) locally
   - Configure connection in `.env`

## Database Setup

### PostgreSQL Schema

```sql
CREATE DATABASE stylegenie;

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2),
    image TEXT,
    url TEXT,
    brand VARCHAR(100),
    rating DECIMAL(3, 2),
    embedding VECTOR(512),  -- Requires pgvector extension
    availability BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ateliers table
CREATE TABLE ateliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    specialization TEXT[],
    price_range VARCHAR(100),
    rating DECIMAL(3, 2),
    portfolio_images TEXT[],
    contact JSONB,
    complexity_range TEXT[],
    categories TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    saved_designs JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd services/api-gateway
pytest
```

## Production Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel:
```bash
vercel --prod
```

### Backend (AWS/GCP/Azure)

1. Build Docker images:
```bash
docker build -t stylegenie-api-gateway ./services/api-gateway
docker build -t stylegenie-image-gen ./services/image-generation
docker build -t stylegenie-search ./services/search-engine
docker build -t stylegenie-atelier ./services/atelier-matching
```

2. Push to container registry:
```bash
docker tag stylegenie-api-gateway your-registry/api-gateway:latest
docker push your-registry/api-gateway:latest
```

3. Deploy using Kubernetes or Docker Swarm

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8000
# Kill process
kill -9 <PID>
```

### Docker Issues
```bash
# Clean up Docker
docker-compose down -v
docker system prune -a
```

### Python Dependencies
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

## Next Steps

1. Integrate actual AI models (see `docs/INTEGRATION.md`)
2. Set up vector database
3. Configure product feeds
4. Add authentication
5. Set up monitoring and logging
