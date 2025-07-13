"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { CustomThemeProvider } from "./_components/custom-theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CustomThemeProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </CustomThemeProvider>
  );
}
