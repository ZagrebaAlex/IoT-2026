import { useEffect, useState } from "react";
import { Alert, Card, CardContent, Stack, Typography } from "@mui/material";

import { fetchJson, getWsUrl } from "../api";
import AppShell from "../components/AppShell";
import NetworkGraph from "../components/NetworkGraph";

export default function DashboardPage() {
  const [nodes, setNodes] = useState([]);
  const [statusText, setStatusText] = useState("Connecting to live stream...");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchJson("/nodes")
      .then((data) => {
        if (active) {
          setNodes(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setStatusText("Failed to load nodes");
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

      setNodes((currentNodes) => {
        const nextNodes = [...currentNodes];
        const existingIndex = nextNodes.findIndex(
          (node) => node.node_id === measurement.node_id,
        );
        const nextNode = {
          node_id: measurement.node_id,
          latest_measurement: measurement,
        };

        if (existingIndex >= 0) {
          nextNodes[existingIndex] = nextNode;
        } else {
          nextNodes.push(nextNode);
          nextNodes.sort((left, right) => left.node_id - right.node_id);
        }

        return nextNodes;
      });
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
  }, []);

  return (
    <AppShell
      eyebrow="AIoT 2025-2026"
      title="Wireless Sensor Network Dashboard"
      statusText={statusText}
    >
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.5}>
            <div>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                Network Nodes
              </Typography>
              <Typography color="text.secondary">
                {nodes.length} node{nodes.length === 1 ? "" : "s"} available
              </Typography>
            </div>

            {error ? <Alert severity="error">{error}</Alert> : null}

            {nodes.length ? (
              <NetworkGraph nodes={nodes} />
            ) : (
              <Typography color="text.secondary">
                No sensor nodes have published data yet.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </AppShell>
  );
}
