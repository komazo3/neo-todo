"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

type Severity = "success" | "error" | "info" | "warning";
const DEFAULT_DURATION = 5000;

type ToastState = {
  open: boolean;
  message: string;
  severity: Severity;
  duration?: number;
};

type ToastApi = {
  show: (message: string, severity?: Severity, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
    duration: DEFAULT_DURATION,
  });

  const api = useMemo<ToastApi>(
    () => ({
      show: (message, severity = "info", duration = DEFAULT_DURATION) =>
        setToast({ open: true, message, severity, duration }),
      success: (message, duration = DEFAULT_DURATION) =>
        setToast({ open: true, message, severity: "success", duration }),
      error: (message, duration = DEFAULT_DURATION) =>
        setToast({ open: true, message, severity: "error", duration }),
      info: (message, duration = DEFAULT_DURATION) =>
        setToast({ open: true, message, severity: "info", duration }),
      warning: (message, duration = DEFAULT_DURATION) =>
        setToast({ open: true, message, severity: "warning", duration }),
    }),
    [],
  );

  const close = () => setToast((t) => ({ ...t, open: false }));

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.duration}
        onClose={close}
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
          onClose={close}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
