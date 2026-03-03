"use client";

import { LocalizationProvider } from "@mui/x-date-pickers";
import ToastProvider from "./components/toastProvider";
import MuiThemeProvider from "./theme-provider";
import { SessionProvider } from "next-auth/react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ja } from "date-fns/locale";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MuiThemeProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
          <ToastProvider>{children}</ToastProvider>
        </LocalizationProvider>
      </MuiThemeProvider>
    </SessionProvider>
  );
}
