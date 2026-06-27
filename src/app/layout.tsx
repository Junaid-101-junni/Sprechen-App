import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Juni Boli Talk - Learn German by Speaking",
  description: "AI-powered German language tutor. Learn by speaking real conversations with Juni Boli Talk AI. Voice-first, real-time corrections, personalized learning path.",
  keywords: ["German", "Deutsch", "language learning", "AI tutor", "voice conversation", "CEFR", "A1", "A2", "B1", "B2", "Juni Boli Talk", "speaking practice"],
  authors: [{ name: "Juni Boli Talk" }],
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Juni Boli Talk",
    description: "Learn German by speaking. Real conversations with AI tutor.",
    siteName: "Juni Boli Talk",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Juni Boli Talk",
  },
};

export const viewport: Viewport = {
  themeColor: "#d4a05a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
