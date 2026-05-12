import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";
import WifiTetheringRoundedIcon from "@mui/icons-material/WifiTetheringRounded";
import { Box, Chip, Container, Stack, Typography } from "@mui/material";

export default function AppShell({
  eyebrow,
  title,
  description,
  statusText,
  children,
  action,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 4 },
        background:
          "radial-gradient(circle at top left, rgba(243, 200, 183, 0.85), transparent 28%), radial-gradient(circle at right, rgba(182, 90, 56, 0.16), transparent 24%), linear-gradient(180deg, #f7f3ed 0%, #f4efe7 100%)",
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Stack spacing={1.5} maxWidth={760}>
              <Chip
                icon={<SensorsRoundedIcon />}
                label={eyebrow}
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "rgba(182, 90, 56, 0.12)",
                  color: "primary.main",
                  borderRadius: 999,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  lineHeight: 0.95,
                }}
              >
                {title}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ maxWidth: 680, lineHeight: 1.6 }}
              >
                {description}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              {action}
              <Chip
                icon={<WifiTetheringRoundedIcon />}
                label={statusText}
                color="secondary"
                variant="outlined"
                sx={{
                  bgcolor: "rgba(255, 252, 247, 0.8)",
                  borderColor: "rgba(46, 125, 90, 0.25)",
                }}
              />
            </Stack>
          </Stack>
          {children}
        </Stack>
      </Container>
    </Box>
  );
}
