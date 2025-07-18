import "@/css/satoshi.css";
import "@/css/style.css";

import { Sidebar } from "@/components/Layouts/sidebar";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { Header } from "@/components/Layouts/header";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./admin/providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin Dashboard",
    default: "Admin Dashboard",
  },
  description: "Admin dashboard for managing the application.",
};

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <Providers>
      <html lang="en" suppressHydrationWarning>
        <body>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          <div className="flex min-h-screen">
            <Sidebar />

            <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
              <Header />

              <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
                {children}
              </main>
            </div>
          </div>
        </body>
      </html>
    </Providers>
  );
}