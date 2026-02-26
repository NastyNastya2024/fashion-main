.PHONY: help dev-frontend dev-backend dev-all build test clean docker-up docker-down

help:
	@echo "StyleGenie Development Commands"
	@echo "  make dev-frontend    - Start frontend development server"
	@echo "  make dev-backend     - Start all backend services"
	@echo "  make dev-all         - Start frontend and backend"
	@echo "  make docker-up       - Start all services with Docker"
	@echo "  make docker-down     - Stop all Docker services"
	@echo "  make build           - Build all services"
	@echo "  make test            - Run tests"
	@echo "  make clean           - Clean build artifacts"

dev-frontend:
	cd frontend && npm install && npm run dev

dev-backend:
	@echo "Starting backend services..."
	@echo "API Gateway: http://localhost:8000"
	@echo "Image Generation: http://localhost:8001"
	@echo "Search Engine: http://localhost:8002"
	@echo "Atelier Matching: http://localhost:8003"
	@make -j4 dev-api-gateway dev-image-gen dev-search dev-atelier

dev-api-gateway:
	cd services/api-gateway && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python main.py

dev-image-gen:
	cd services/image-generation && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python main.py

dev-search:
	cd services/search-engine && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python main.py

dev-atelier:
	cd services/atelier-matching && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python main.py

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

build:
	cd frontend && npm install && npm run build

test:
	@echo "Running tests..."
	# Add test commands here

clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type d -name "*.egg-info" -exec rm -r {} +
	find . -type d -name "venv" -exec rm -r {} +
	find . -type d -name ".next" -exec rm -r {} +
	find . -type d -name "node_modules" -exec rm -r {} +
