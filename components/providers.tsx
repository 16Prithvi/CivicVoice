"use client";

import { ReactNode, useEffect } from "react";
import { initializeDataStore } from "@/lib/data-store";
import { ToastProvider } from "./toast-provider";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize data store on client side
    initializeDataStore();
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
