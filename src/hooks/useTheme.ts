"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "kifaru-theme";

function subscribe(callback: () => void) {
  window.addEventListener("kifaru-theme-change", callback);
  return () => window.removeEventListener("kifaru-theme-change", callback);
}

function getSnapshot(): "light" | "dark" {
  return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const next = getSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event("kifaru-theme-change"));
  }, []);

  return { theme, toggleTheme };
}
