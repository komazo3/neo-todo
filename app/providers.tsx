"use client";

import ToastProvider from "./components/toastProvider";
import MuiThemeProvider from "./theme-provider";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MuiThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </MuiThemeProvider>
    </SessionProvider>
  );
}
