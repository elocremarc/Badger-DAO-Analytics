import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#F2BC1B",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#181818",
      paper: "#2b2b2b",
    },
    text: {
      primary: "#fff",
      secondary: "#F2BC1B",
      disabled: "rgba(245,241,241,0.5)",
      hint: "#ffffff",
    },
  },
});
