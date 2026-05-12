# IoT-2026
Wireless Sensor Network (WSN) end-to-end project for the Internet of Things course 2025–2026. The project implements a TinyOS-based star topology network using TelosB and IRIS motes, real-time sensor data collection, MongoDB storage, live visualization dashboards, and machine learning analysis for sensor measurement forecasting.

## Frontend dashboard

Question 3 is implemented as a React frontend built with Vite and Material UI.

- `/` shows all available nodes in a responsive grid.
- Hovering a node card shows the latest live measurement in a tooltip.
- Clicking a node opens `/nodes/{node_id}`.
- The node details page shows the latest measurement at the top.
- The node details page includes Material UI charts for temperature, humidity, and count history.
- The node details page includes a date and time range filter for loading archived data.

### Backend routes used by the frontend

- `GET /health` returns backend health status
- `GET /nodes` returns all detected nodes with their latest measurement
- `GET /nodes/{node_id}/latest` returns the newest measurement for one node
- `GET /measurements/history` returns measurements for a selected date range
- `GET /ws/measurements` streams the latest incoming measurements in real time

### Running the app

Build the React frontend once from the `backend/frontend` folder:

```bash
npm install
npm run build
```

Then start the backend with uvicorn from the `backend` folder:

```bash
uvicorn app:app --reload
```

Then open [http://localhost:8000](http://localhost:8000).

### Frontend development mode

If you want to work on the React app directly:

```bash
cd backend/frontend
npm install
npm run dev
```

This starts the Vite development server on [http://127.0.0.1:5173](http://127.0.0.1:5173).
