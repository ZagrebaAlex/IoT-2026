import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { fetchJson, getWsUrl } from "../api";
import AppShell from "../components/AppShell";
import HistoryChartCard from "../components/HistoryChartCard";
import LatestMetrics from "../components/LatestMetrics";
import { toDatetimeLocalValue } from "../utils";

function createInitialRange() {
  const now = new Date();
  const previousDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return {
    fromDate: toDatetimeLocalValue(previousDay),
    toDate: toDatetimeLocalValue(now),
  };
}

export default function NodeDetailsPage() {
  const { nodeId } = useParams();
  const numericNodeId = Number(nodeId);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  const [history, setHistory] = useState([]);
  const [statusText, setStatusText] = useState("Connecting to live stream...");
  const [error, setError] = useState("");
  const [range, setRange] = useState(createInitialRange);

  async function loadHistory(nextRange = range) {
    if (!nextRange.fromDate || !nextRange.toDate) {
      return;
    }

    const params = new URLSearchParams({
      from_date: new Date(nextRange.fromDate).toISOString(),
      to_date: new Date(nextRange.toDate).toISOString(),
      node_id: String(numericNodeId),
    });

    const data = await fetchJson(`/measurements/history?${params.toString()}`);
    setHistory(data);
  }

  useEffect(() => {
    let active = true;

    Promise.all([fetchJson(`/nodes/${numericNodeId}/latest`), loadHistory(range)])
      .then(([latest]) => {
        if (active) {
          setLatestMeasurement(latest);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setStatusText("Failed to load node data");
        }
      });

    const socket = new WebSocket(getWsUrl());

    socket.addEventListener("open", () => {
      if (active) {
        setStatusText("Live stream connected");
      }
    });

    socket.addEventListener("message", (event) => {
      if (!active) {
        return;
      }

      const measurement = JSON.parse(event.data);

      if (measurement.node_id === numericNodeId) {
        setLatestMeasurement(measurement);
      }
    });

    socket.addEventListener("close", () => {
      if (active) {
        setStatusText("Live stream disconnected");
      }
    });

    return () => {
      active = false;
      socket.close();
    };
  }, [numericNodeId]);

  useEffect(() => {
    if (!range.fromDate || !range.toDate) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setError("");
        await loadHistory(range);
      } catch (err) {
        setError(err.message);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [numericNodeId, range]);

  return (
    <AppShell
      eyebrow={`Node ${numericNodeId}`}
      title={`Node #${numericNodeId} analytics`}
      description="Inspect the latest live reading and explore historical measurements with Material UI charts."
      statusText={statusText}
      action={
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackRoundedIcon />}
          variant="outlined"
          color="primary"
        >
          Back to dashboard
        </Button>
      }
    >
      <Stack spacing={3}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2}>
              <div>
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  Latest Data
                </Typography>
                <Typography color="text.secondary">
                  Real-time values from the selected sensor node.
                </Typography>
              </div>
              {latestMeasurement ? (
                <LatestMetrics measurement={latestMeasurement} />
              ) : (
                <Typography color="text.secondary">Waiting for measurement...</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2.5}>
              <div>
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  Historical Measurements
                </Typography>
                <Typography color="text.secondary">
                  Choose a date and time range. Historical data loads automatically.
                </Typography>
              </div>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="From"
                  type="datetime-local"
                  value={range.fromDate}
                  onChange={(event) =>
                    setRange((current) => ({ ...current, fromDate: event.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="To"
                  type="datetime-local"
                  value={range.toDate}
                  onChange={(event) =>
                    setRange((current) => ({ ...current, toDate: event.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>

              <Typography color="text.secondary">
                {history.length} measurements loaded for the selected time range.
              </Typography>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <Stack spacing={2}>
                <HistoryChartCard
                  title="Temperature"
                  subtitle="Temperature values over time"
                  data={history}
                  dataKey="temperature"
                  color="#b65a38"
                />
                <HistoryChartCard
                  title="Humidity"
                  subtitle="Humidity values over time"
                  data={history}
                  dataKey="humidity"
                  color="#2e7d5a"
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </AppShell>
  );
}
