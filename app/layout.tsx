/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Inter, Public_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/layouts/AppShell";

const inter = Inter({ subsets: ["latin"] });
const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

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
    <html lang="en" className={publicSans.variable}>
      <body className={`${inter.className} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
