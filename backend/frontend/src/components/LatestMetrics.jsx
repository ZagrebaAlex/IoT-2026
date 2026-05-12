import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import ThermostatRoundedIcon from "@mui/icons-material/ThermostatRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";

import { formatTimestamp } from "../utils";

const metricDefinitions = [
  {
    key: "temperature",
    label: "Temperature",
    icon: ThermostatRoundedIcon,
    suffix: " C",
  },
  {
    key: "humidity",
    label: "Humidity",
    icon: WaterDropRoundedIcon,
    suffix: " %",
  },
  {
    key: "count",
    label: "Packet Count",
    icon: NumbersRoundedIcon,
    suffix: "",
  },
  {
    key: "timestamp",
    label: "Timestamp",
    icon: AccessTimeRoundedIcon,
    suffix: "",
  },
];

export default function LatestMetrics({ measurement }) {
  return (
    <Grid container spacing={2}>
      {metricDefinitions.map(({ key, label, icon: Icon, suffix }) => {
        const value =
          key === "timestamp"
            ? formatTimestamp(measurement?.timestamp)
            : `${measurement?.[key] ?? "--"}${suffix}`;

        return (
          <Grid key={key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Icon fontSize="small" color="primary" />
                    <Typography variant="overline" color="text.secondary">
                      {label}
                    </Typography>
                  </Stack>
                  <Typography variant="h4" sx={{ fontSize: key === "timestamp" ? "1.1rem" : "2rem" }}>
                    {value}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
