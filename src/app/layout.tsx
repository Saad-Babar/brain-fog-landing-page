import type { Metadata } from "next";
import { Source_Sans_3, Manrope } from "next/font/google";
import Providers from "./providers";

import "./(app)/globals.css";

const manrope = Manrope({ subsets: ['latin'] });
const sourceSans = Source_Sans_3({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Brain Fog Monitor - Medical Software",
  description: "Early detection of brain fog and anxiety through behavioral patterns",
  openGraph: {
    title: "Brain Fog Monitor - Medical Software",
    description: "Early detection of brain fog and anxiety through behavioral patterns",
    url: "https://brain-fog-monitor.vercel.app",
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 675,
        alt: "Brain Fog Monitor",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Brain Fog Monitor - Medical Software",
    description: "Early detection of brain fog and anxiety through behavioral patterns",
    images: ['/images/twitter-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.className} ${sourceSans.className} antialiased urdu-font`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 