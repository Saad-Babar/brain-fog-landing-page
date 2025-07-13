"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeManager() {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    const html = document.documentElement;
    const currentTheme = theme === "system" ? systemTheme : theme;
    
    if (currentTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme, systemTheme]);

  return null;
} 