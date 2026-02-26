# StyleGenie 🎨

AI-powered fashion application for generating custom dress designs and finding similar products or ateliers.

## ✨ Features

- 🎨 **AI Image Generation**: Generate 4 unique fashion designs from text prompts
- 🔍 **Product Search**: Find similar products on marketplaces using vector similarity
- ✂️ **Atelier Matching**: Connect with tailors and designers for custom creation
- 📱 **Mobile-First Design**: Premium UI optimized for mobile devices
- 🚀 **Fast & Scalable**: Microservices architecture with <5s generation time

## 🏗 Architecture

```
Frontend (Next.js) → API Gateway → Microservices
                                              ├── Image Generation
                                              ├── Search Engine
                                              └── Atelier Matching
```

### Services
- **Image Generation Service**: Text-to-image generation using SDXL/Flux
- **Fashion Search Engine**: Vector similarity search for products using CLIP
- **Atelier Matching Engine**: ML-based atelier recommendations

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/yourusername/fashion.git
cd fashion

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Local Development

#### Start Backend Services

```bash
# Using the development script
./scripts/dev.sh

# Or manually
make dev-backend
```

#### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000

### Option 3: Публикация на GitHub Pages

В корне репозитория есть статическая версия для GitHub Pages (чистый HTML/CSS/JS, без сервера):

- **index.html** — главная страница с чатом
- **css/style.css** — стили
- **js/app.js** — вся логика (шаги, быстрые ответы, карточки товаров и ателье, мок-поиск)

**Как опубликовать:**

1. В настройках репозитория: **Settings → Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` (или `master`), папка **/ (root)**
4. Сохранить — через минуту сайт будет доступен по адресу `https://<username>.github.io/<repo>/`

Логика полностью сохранена: приветствие → ценовой сегмент → повод → «поиск» (мок) → результаты с карточками → «Нашёл?» → при «Нет» — мастера/ателье, генерация образа, новый поиск.

## 📁 Project Structure

```
├── frontend/              # Next.js frontend (TypeScript, Tailwind)
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   └── package.json
├── services/             # Backend microservices
│   ├── api-gateway/      # API Gateway (FastAPI)
│   ├── image-generation/ # Image generation service
│   ├── search-engine/    # Product search service
│   └── atelier-matching/ # Atelier matching service
├── shared/               # Shared schemas and types
├── docs/                 # Documentation
├── scripts/              # Development scripts
└── docker-compose.yml    # Docker orchestration
```

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Python FastAPI, PostgreSQL, Pinecone/Weaviate
- **AI**: Stable Diffusion XL, CLIP, Transformers
- **Infrastructure**: Docker, Redis, S3

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Architecture](docs/ARCHITECTURE.md) - System architecture overview
- [Integration Guide](docs/INTEGRATION.md) - AI model and service integration

## 🔧 Configuration

Create a `.env` file based on `.env.example`:

```bash
# Required API Keys
REPLICATE_API_TOKEN=your_token  # or HUGGINGFACE_API_TOKEN
PINECONE_API_KEY=your_key       # or WEAVIATE_URL
AWS_ACCESS_KEY_ID=your_key      # for S3 image storage
```

See [Setup Guide](docs/SETUP.md) for detailed configuration.

## 🧪 Development

```bash
# Install dependencies
make dev-frontend    # Frontend only
make dev-backend     # Backend services only
make dev-all         # Everything

# Docker
make docker-up       # Start all services
make docker-down     # Stop all services

# Cleanup
make clean           # Remove build artifacts
```

## 📝 API Endpoints

### Generate Images
```bash
POST /api/v1/generate
{
  "prompt": "Элегантное вечернее платье",
  "type": "dress",
  "occasion": "party",
  "colorPalette": "бордо, золото"
}
```

### Search Products
```bash
POST /api/v1/search
{
  "imageUrl": "https://...",
  "max_results": 20,
  "min_similarity": 0.7
}
```

### Find Ateliers
```bash
POST /api/v1/ateliers
{
  "imageUrl": "https://...",
  "location": "Москва",
  "budget": 50000
}
```

## 🎯 Roadmap

- [ ] User authentication & profiles
- [ ] Payment integration
- [ ] Real-time notifications
- [ ] Advanced AI features (inpainting, style transfer)
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics & insights

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details
