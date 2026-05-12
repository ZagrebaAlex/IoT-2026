import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#b65a38",
    },
    secondary: {
      main: "#2e7d5a",
    },
    background: {
      default: "#f4efe7",
      paper: "rgba(255, 252, 247, 0.9)",
    },
    text: {
      primary: "#1f1a17",
      secondary: "#69574a",
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.04em",
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(79, 54, 33, 0.12)",
          boxShadow: "0 20px 45px rgba(83, 58, 41, 0.12)",
          backdropFilter: "blur(12px)",
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
  },
});

export default theme;
