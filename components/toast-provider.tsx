"use client";

import { ReactNode, useEffect, useState } from "react";
import { ToastContainer, Toast } from "./toast";

let toastIdCounter = 0;
const toastListeners: ((toast: Toast) => void)[] = [];

export function addToastListener(listener: (toast: Toast) => void) {
  toastListeners.push(listener);
  return () => {
    const index = toastListeners.indexOf(listener);
    if (index > -1) toastListeners.splice(index, 1);
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
    };
    toastListeners.push(listener);

    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

export function showToastMessage(message: string, type: Toast["type"] = "info") {
  const toast: Toast = {
    id: `toast-${++toastIdCounter}-${Date.now()}`,
    message,
    type,
  };
  toastListeners.forEach((listener) => listener(toast));
  return toast.id;
}
