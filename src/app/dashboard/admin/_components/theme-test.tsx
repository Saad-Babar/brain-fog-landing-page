"use client";

import { useCustomTheme } from "./custom-theme-provider";

export function ThemeTest() {
  const { theme, resolvedTheme } = useCustomTheme();
  
  return (
    <div className="fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 border rounded">
      <p className="text-sm">Theme: {theme} (Resolved: {resolvedTheme})</p>
    </div>
  );
} 