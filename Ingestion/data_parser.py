"""
This script reads lines from a serial port, and parses them into mongodb documents.

Expected input line format from the collector mote:
node=1,temp=6588,humidity=1336,count=14
"""

import os
import sys
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()


MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION")


def convert_raw_temperature(raw_temperature: int) -> float:
    return round(-39.6 + (0.01 * raw_temperature), 2)


def convert_raw_humidity(raw_humidity: int, temperature_celsius: float) -> float:
    humidity_linear = -4 + (0.0405 * raw_humidity) - (0.0000028 * (raw_humidity ** 2))
    humidity_compensated = (
        (temperature_celsius - 25.0) * (0.01 + (0.00008 * raw_humidity))
    ) + humidity_linear

    return round(max(0.0, min(100.0, humidity_compensated)), 2)



def parse_line(line: str) -> dict | None:
    """
    Converts a serial line into a MongoDB document.

    Example:
    node=1,temp=6588,humidity=1336,count=14
    """

    if not line:
        return None

    try:
        parts = line.split(",")

        values = {}

        for part in parts:
            key, value = part.split("=")
            values[key.strip()] = value.strip()

        raw_temperature = int(values["temp"])
        raw_humidity = int(values["humidity"])
        temperature = convert_raw_temperature(raw_temperature)
        humidity = convert_raw_humidity(raw_humidity, temperature)

        return {
            "timestamp": datetime.now(timezone.utc),
            "node_id": int(values["node"]),
            "temperature": temperature,
            "humidity": humidity,
            "count": int(values["count"]),
            "raw_temperature": raw_temperature,
            "raw_humidity": raw_humidity,
            "raw_line": line,
        }

    except Exception as error:
        print(f"Invalid line skipped: {line}")
        print(f"Reason: {error}")
        return None


def store_document(collection, line: str) -> None:
    document = parse_line(line)

    if document is None:
        return

    collection.insert_one(document)
    print(
        "Inserted measurement "
        f"node={document['node_id']} "
        f"temp={document['temperature']}C "
        f"humidity={document['humidity']}% "
        f"count={document['count']}"
    )


def process_line(collection, line: str) -> None:
    cleaned_line = line.strip()

    if not cleaned_line:
        return

    if not cleaned_line.startswith("node="):
        print(f"Skipping non-measurement line: {cleaned_line}")
        return

    print(f"Received: {cleaned_line}")
    store_document(collection, cleaned_line)


def main() -> None:
    mongo_client = MongoClient(MONGO_URI)
    database = mongo_client[MONGO_DB]
    collection = database[MONGO_COLLECTION]

    print("Reading sensor data from stdin...")

    for line in sys.stdin:
        process_line(collection, line)


if __name__ == "__main__":
    main()
