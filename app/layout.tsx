import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/layouts/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CivicPulse – Intelligent Election Assistant",
  description:
    "Your personal AI-powered guide to voting. Check eligibility, find your polling place, and navigate elections with confidence.",
  keywords: ["voting", "election", "voter registration", "polling place", "civic"],
  openGraph: {
    title: "CivicPulse – Intelligent Election Assistant",
    description: "Navigate elections with confidence using AI-powered civic guidance.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
