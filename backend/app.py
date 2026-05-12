
import os
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Optional

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient, DESCENDING


load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "iot_project")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "measurements")


mongo_client = MongoClient(MONGO_URI)
database = mongo_client[MONGO_DB]
measurements_collection = database[MONGO_COLLECTION]
frontend_dir = Path(__file__).resolve().parent / "frontend"
frontend_dist_dir = frontend_dir / "dist"
frontend_assets_dir = frontend_dist_dir / "assets"


app = FastAPI(title="IoT Project Backend")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if frontend_assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=frontend_assets_dir), name="assets")


def serialize_document(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "timestamp": document["timestamp"].isoformat()
        if isinstance(document.get("timestamp"), datetime)
        else document.get("timestamp"),
        "node_id": document.get("node_id"),
        "temperature": document.get("temperature"),
        "humidity": document.get("humidity"),
        "count": document.get("count"),
        "raw_line": document.get("raw_line"),
    }


def get_frontend_index() -> FileResponse:
    index_path = frontend_dist_dir / "index.html"

    if not index_path.exists():
        raise HTTPException(
            status_code=503,
            detail="Frontend build not found. Run `npm run build` in backend/frontend.",
        )

    return FileResponse(index_path)


@app.get("/")
def root_page() -> FileResponse:
    return get_frontend_index()


@app.get("/health")
def get_health() -> dict:
    return {
        "status": "ok",
        "message": "IoT Project Backend is running",
    }


@app.get("/nodes/{node_id}")
def node_details_page(node_id: int) -> FileResponse:
    return get_frontend_index()


@app.get("/measurements/history")
def get_historical_measurements(
    from_date: datetime = Query(..., description="Start datetime in ISO format"),
    to_date: datetime = Query(..., description="End datetime in ISO format"),
    node_id: Optional[int] = Query(None, description="Node id filter"),
) -> list[dict]:
    """
    Returns historical measurements between two datetimes.

    Example:
    /measurements/history?from_date=2026-05-06T00:00:00Z&to_date=2026-05-07T00:00:00Z

    Optional:
    /measurements/history?from_date=...&to_date=...&node_id=1
    """

    query = {
        "timestamp": {
            "$gte": from_date,
            "$lte": to_date,
        }
    }

    if node_id is not None:
        query["node_id"] = node_id

    documents = measurements_collection.find(query).sort("timestamp", 1)

    return [serialize_document(document) for document in documents]


@app.get("/nodes")
def get_nodes() -> list[dict]:
    node_ids = measurements_collection.distinct("node_id")
    nodes: list[dict] = []

    for node_id in sorted(node_ids):
        latest_document = measurements_collection.find_one(
            {"node_id": node_id},
            sort=[("timestamp", DESCENDING)],
        )

        if latest_document is None:
            continue

        nodes.append(
            {
                "node_id": node_id,
                "latest_measurement": serialize_document(latest_document),
            }
        )

    return nodes


@app.get("/nodes/{node_id}/latest")
def get_latest_measurement_for_node(node_id: int) -> dict:
    latest_document = measurements_collection.find_one(
        {"node_id": node_id},
        sort=[("timestamp", DESCENDING)],
    )

    if latest_document is None:
        raise HTTPException(status_code=404, detail="Node not found")

    return serialize_document(latest_document)


@app.get("/{full_path:path}")
def frontend_routes(full_path: str) -> FileResponse:
    if full_path.startswith(("health", "nodes", "measurements", "ws", "docs", "redoc", "openapi.json", "assets")):
        raise HTTPException(status_code=404, detail="Not found")

    return get_frontend_index()

@app.websocket("/ws/measurements")
async def websocket_measurements(websocket: WebSocket):
    await websocket.accept()

    last_sent_id: ObjectId | None = None

    try:
        while True:
            latest_document = measurements_collection.find_one(
                sort=[("timestamp", DESCENDING)]
            )

            if latest_document is not None:
                current_id = latest_document["_id"]

                if current_id != last_sent_id:
                    await websocket.send_json(serialize_document(latest_document))
                    last_sent_id = current_id

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        print("WebSocket client disconnected")
