import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quadeer's terminal",
  description: "Quadeer's terminal",
  openGraph: {
    title: "Quadeer's terminal",
    description: "Quadeer's interactive terminal portfolio",
    url: "https://t-quadeer.vercel.app",
    type: "website",
    images: [
      {
        url: "https://t-quadeer.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Quadeer's terminal portfolio",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
