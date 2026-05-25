FROM python:3.14-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_PROGRESS_BAR=off

COPY backend/requirements.txt /tmp/backend-requirements.txt
RUN pip install --progress-bar off --no-cache-dir -r /tmp/backend-requirements.txt

COPY backend /app/backend

WORKDIR /app/backend

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
