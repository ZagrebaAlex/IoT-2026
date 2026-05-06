"""
This script reads lines from a serial port, and parses into mongodb documents.

Expected input line format:
node=1,temp=24.5,humidity=55.2,count=14
"""

import os
from datetime import datetime, timezone

import serial
from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()


MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION")
SERIAL_PORT = os.getenv("SERIAL_PORT")
BAUD_RATE = int(os.getenv("BAUD_RATE"))



def parse_line(line: str) -> dict | None:
    """
    Converts a serial line into a MongoDB document.

    Example:
    node=1,temp=24.5,humidity=55.2,count=14
    """

    if not line:
        return None

    try:
        parts = line.split(",")

        values = {}

        for part in parts:
            key, value = part.split("=")
            values[key.strip()] = value.strip()

        return {
            "timestamp": datetime.now(timezone.utc),
            "node_id": int(values["node"]),
            "temperature": float(values["temp"]),
            "humidity": float(values["humidity"]),
            "count": int(values["count"]),
            "raw_line": line,
        }

    except Exception as error:
        print(f"Invalid line skipped: {line}")
        print(f"Reason: {error}")
        return None


def main() -> None:

    mongo_client = MongoClient(MONGO_URI)
    database = mongo_client[MONGO_DB]
    collection = database[MONGO_COLLECTION]

    with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as serial_connection:
        print("Listening for sensor data...")

        while True:
            raw_bytes = serial_connection.readline()

            if not raw_bytes:
                continue

            line = raw_bytes.decode("utf-8", errors="ignore").strip()

            print(f"Received: {line}")

            document = parse_line(line)

            if document is None:
                continue

            collection.insert_one(document)

            print(f"Inserted measurement from node {document['node_id']}")


    ## For testing without serial device.
    # with open("test_data.txt", "r") as file:
    #     print("Reading simulated sensor data...")

    #     for line in file:
    #         line = line.strip()

    #         if not line:
    #             continue

    #         print(f"Received: {line}")

    #         document = parse_line(line)

    #         if document is None:
    #             continue

    #         collection.insert_one(document)

    #         print(f"Inserted measurement from node {document['node_id']}")
  
    


if __name__ == "__main__":
    main()