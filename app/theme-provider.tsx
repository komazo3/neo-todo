"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { blue, lime, purple } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: blue,
    secondary: blue,
  },
});

export default function MuiThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
