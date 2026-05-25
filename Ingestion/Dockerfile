FROM python:3.14-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_PROGRESS_BAR=off

COPY Ingestion/requirements.txt /tmp/ingestion-requirements.txt
RUN pip install --progress-bar off --no-cache-dir -r /tmp/ingestion-requirements.txt

COPY Ingestion /app/Ingestion

WORKDIR /app/Ingestion

CMD ["python", "data_parser.py"]
