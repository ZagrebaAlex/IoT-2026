import HubRoundedIcon from "@mui/icons-material/HubRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import ThermostatRoundedIcon from "@mui/icons-material/ThermostatRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import {
  Box,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { formatTimestamp } from "../utils";

function getNodePosition(index, total, radius) {
  if (total === 1) {
    return { x: 50, y: 16 };
  }

  const angle = (-Math.PI / 2) + ((2 * Math.PI * index) / total);

  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
  };
}

function SensorNode({ node, x, y }) {
  const measurement = node.latest_measurement;

  const tooltipContent = (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ color: "#fff" }}>
        Node #{node.node_id}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <ThermostatRoundedIcon fontSize="small" />
        <Typography variant="body2">{measurement?.temperature ?? "--"} C</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <WaterDropRoundedIcon fontSize="small" />
        <Typography variant="body2">{measurement?.humidity ?? "--"} %</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <TimelineRoundedIcon fontSize="small" />
        <Typography variant="body2">Count {measurement?.count ?? "--"}</Typography>
      </Stack>
      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
        {formatTimestamp(measurement?.timestamp)}
      </Typography>
    </Stack>
  );

  return (
    <Tooltip
      title={tooltipContent}
      arrow
      placement="top"
      slotProps={{ tooltip: { sx: { bgcolor: "rgba(31, 26, 23, 0.96)" } } }}
    >
      <Box
        component={RouterLink}
        to={`/nodes/${node.node_id}`}
        sx={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%)",
          width: { xs: 104, md: 116 },
          height: { xs: 104, md: 116 },
          borderRadius: "50%",
          border: "1px solid rgba(182, 90, 56, 0.28)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246, 234, 226, 0.92))",
          boxShadow: "0 18px 32px rgba(83, 58, 41, 0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "text.primary",
          textDecoration: "none",
          transition: "transform 180ms ease, box-shadow 180ms ease",
          "&:hover": {
            transform: "translate(-50%, -50%) scale(1.04)",
            boxShadow: "0 24px 40px rgba(83, 58, 41, 0.22)",
          },
        }}
      >
        <Stack spacing={0.5} alignItems="center">
          <MemoryRoundedIcon color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            #{node.node_id}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sensor
          </Typography>
        </Stack>
      </Box>
    </Tooltip>
  );
}

export default function NetworkGraph({ nodes }) {
  const radius = nodes.length <= 4 ? 34 : nodes.length <= 8 ? 38 : 40;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: 420, md: 640 },
        borderRadius: 4,
        overflow: "hidden",
        background:
          "radial-gradient(circle at center, rgba(182, 90, 56, 0.10), transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,252,247,0.82))",
        border: "1px solid rgba(79, 54, 33, 0.08)",
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {nodes.map((node, index) => {
          const point = getNodePosition(index, nodes.length, radius);

          return (
            <line
              key={node.node_id}
              x1="50"
              y1="50"
              x2={point.x}
              y2={point.y}
              stroke="rgba(182, 90, 56, 0.25)"
              strokeWidth="0.4"
              strokeDasharray="0.8 0.8"
            />
          );
        })}
      </Box>

      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: 132, md: 164 },
          height: { xs: 132, md: 164 },
          borderRadius: "50%",
          background: "linear-gradient(180deg, #b65a38, #8d4327)",
          color: "#fff",
          boxShadow: "0 24px 48px rgba(126, 50, 22, 0.28)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <Stack spacing={1} alignItems="center">
          <HubRoundedIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight={700}>
            Collector
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.84, maxWidth: 110 }}>
            Central parent node
          </Typography>
        </Stack>
      </Box>

      {nodes.map((node, index) => {
        const point = getNodePosition(index, nodes.length, radius);
        return <SensorNode key={node.node_id} node={node} x={point.x} y={point.y} />;
      })}
    </Box>
  );
}
