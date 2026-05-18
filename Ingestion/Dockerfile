FROM python:3.14-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY Ingestion/requirements.txt /tmp/ingestion-requirements.txt
RUN pip install --no-cache-dir -r /tmp/ingestion-requirements.txt

COPY Ingestion /app/Ingestion

WORKDIR /app/Ingestion

CMD ["python", "data_parser.py"]
