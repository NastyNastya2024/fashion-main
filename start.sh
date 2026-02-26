#!/bin/bash

echo "🎨 Запуск StyleGenie"
echo "===================="
echo ""

# Проверка зависимостей
echo "Проверка зависимостей..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js: https://nodejs.org"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 не установлен. Установите Python 3.11+"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ Python: $(python3 --version)"
echo ""

# Установка зависимостей Frontend
echo "📦 Установка зависимостей Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Зависимости Frontend уже установлены"
fi
cd ..

# Установка зависимостей Backend
echo ""
echo "📦 Установка зависимостей Backend..."

setup_service() {
    local service=$1
    local port=$2
    echo "  → Настройка $service..."
    cd "services/$service"
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -q -r requirements.txt
    deactivate
    cd ../..
}

setup_service "api-gateway" "8000"
setup_service "image-generation" "8001"
setup_service "search-engine" "8002"
setup_service "atelier-matching" "8003"

echo ""
echo "✅ Все зависимости установлены!"
echo ""
echo "🚀 Для запуска проекта:"
echo ""
echo "Вариант 1: Запустить все сервисы вручную"
echo "  Откройте 4 терминала и выполните:"
echo ""
echo "  Терминал 1 (API Gateway):"
echo "    cd services/api-gateway && source venv/bin/activate && python main.py"
echo ""
echo "  Терминал 2 (Image Generation):"
echo "    cd services/image-generation && source venv/bin/activate && python main.py"
echo ""
echo "  Терминал 3 (Search Engine):"
echo "    cd services/search-engine && source venv/bin/activate && python main.py"
echo ""
echo "  Терминал 4 (Atelier Matching):"
echo "    cd services/atelier-matching && source venv/bin/activate && python main.py"
echo ""
echo "  Терминал 5 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "Вариант 2: Использовать Docker"
echo "    docker-compose up --build"
echo ""
echo "📖 Подробные инструкции: см. QUICK_START.md"
