FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /app/backend/frontend

COPY backend/frontend/package*.json ./
RUN npm ci

COPY backend/frontend/ ./
RUN npm run build


FROM python:3.14-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY backend/requirements.txt /tmp/backend-requirements.txt
RUN pip install --no-cache-dir -r /tmp/backend-requirements.txt

COPY backend /app/backend
COPY --from=frontend-builder /app/backend/frontend/dist /app/backend/frontend/dist

WORKDIR /app/backend

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
