"use client";

import ToastProvider from "./components/toastProvider";
import MuiThemeProvider from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </MuiThemeProvider>
  );
}
