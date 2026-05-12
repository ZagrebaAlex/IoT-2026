import DeviceHubRoundedIcon from "@mui/icons-material/DeviceHubRounded";
import ThermostatRoundedIcon from "@mui/icons-material/ThermostatRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { formatTimestamp } from "../utils";

export default function NodeCard({ node }) {
  const measurement = node.latest_measurement;

  const tooltipContent = (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={{ color: "#fff" }}>
        Latest reading
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
    <Tooltip title={tooltipContent} arrow placement="top" slotProps={{ tooltip: { sx: { bgcolor: "rgba(31, 26, 23, 0.96)" } } }}>
      <Card sx={{ height: "100%", borderRadius: 3 }}>
        <CardActionArea component={RouterLink} to={`/nodes/${node.node_id}`} sx={{ height: "100%" }}>
          <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 3, minHeight: 210 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Chip icon={<DeviceHubRoundedIcon />} label="Node" size="small" />
              <Typography variant="overline" color="primary.main">
                Live
              </Typography>
            </Stack>
            <div>
              <Typography variant="h3" sx={{ mb: 1, fontSize: "2rem" }}>
                #{node.node_id}
              </Typography>
              <Typography color="text.secondary">Updated {formatTimestamp(measurement?.timestamp)}</Typography>
            </div>
            <Stack direction="row" spacing={1.5}>
              <Chip label={`${measurement?.temperature ?? "--"} C`} color="primary" variant="outlined" />
              <Chip label={`${measurement?.humidity ?? "--"} %`} color="secondary" variant="outlined" />
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </Tooltip>
  );
}
