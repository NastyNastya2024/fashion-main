# 🚀 Быстрый запуск StyleGenie

## Вариант 1: Локальная разработка (рекомендуется для начала)

### Шаг 1: Установить зависимости Frontend

```bash
cd frontend
npm install
```

### Шаг 2: Запустить Backend сервисы

Откройте 4 терминала и запустите каждый сервис:

**Терминал 1 - API Gateway:**
```bash
cd services/api-gateway
python3 -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
Сервис запустится на http://localhost:8000

**Терминал 2 - Image Generation:**
```bash
cd services/image-generation
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
Сервис запустится на http://localhost:8001

**Терминал 3 - Search Engine:**
```bash
cd services/search-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
Сервис запустится на http://localhost:8002

**Терминал 4 - Atelier Matching:**
```bash
cd services/atelier-matching
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
Сервис запустится на http://localhost:8003

### Шаг 3: Запустить Frontend

В новом терминале:
```bash
cd frontend
npm run dev
```

Приложение будет доступно на **http://localhost:3000**

---

## Вариант 2: Docker (все сервисы сразу)

### Шаг 1: Запустить все через Docker

```bash
docker-compose up --build
```

Это запустит все сервисы автоматически:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- Все backend сервисы

---

## Проверка работы

1. Откройте http://localhost:3000 в браузере
2. Заполните форму генерации образа
3. Нажмите "Создать 4 образа"

**Примечание:** На данный момент AI модели не интегрированы, поэтому будут возвращаться placeholder изображения. Для реальной генерации нужно:
- Получить API ключ от Replicate или HuggingFace
- Добавить его в `.env` файл
- Интегрировать в `services/image-generation/main.py`

---

## Устранение проблем

### Порт занят
```bash
# Найти процесс на порту
lsof -i :8000
# Остановить процесс
kill -9 <PID>
```

### Ошибки Python
```bash
# Переустановить зависимости
pip install --upgrade -r requirements.txt
```

### Ошибки Node.js
```bash
# Очистить и переустановить
rm -rf node_modules package-lock.json
npm install
```
