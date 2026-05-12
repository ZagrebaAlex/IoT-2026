import { Card, CardContent, Stack, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

export default function HistoryChartCard({ title, subtitle, data, dataKey, color }) {
  const chartData = data.map((item) => ({
    x: new Date(item.timestamp),
    y: Number(item[dataKey]),
  }));

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <div>
            <Typography variant="h6">{title}</Typography>
            <Typography color="text.secondary">{subtitle}</Typography>
          </div>

          {chartData.length ? (
            <LineChart
              height={320}
              series={[
                {
                  data: chartData.map((item) => item.y),
                  label: title,
                  color,
                  curve: "linear",
                },
              ]}
              xAxis={[
                {
                  data: chartData.map((item) => item.x),
                  scaleType: "time",
                  valueFormatter: (value) => new Date(value).toLocaleString(),
                },
              ]}
              grid={{ horizontal: true, vertical: true }}
              margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
            />
          ) : (
            <Typography color="text.secondary">No measurements in the selected time range.</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
