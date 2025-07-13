import type { Metadata } from "next";
import { Source_Sans_3, Manrope } from "next/font/google";
import { siteDetails } from '@/data/siteDetails';

import "../(app)/globals.css";

const manrope = Manrope({ subsets: ['latin'] });
const sourceSans = Source_Sans_3({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Register - " + siteDetails.metadata.title,
  description: "Create your account and join our platform",
  openGraph: {
    title: "Register - " + siteDetails.metadata.title,
    description: "Create your account and join our platform",
    url: siteDetails.siteUrl + "/register",
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 675,
        alt: siteDetails.siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Register - " + siteDetails.metadata.title,
    description: "Create your account and join our platform",
    images: ['/images/twitter-image.jpg'],
  },
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.className} ${sourceSans.className} antialiased`}
      >
        <main>
          {children}
        </main>
      </body>
    </html>
  );
} 