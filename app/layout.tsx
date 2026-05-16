import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InstaVid – Free Instagram Video Downloader | Download Reels & Posts",
  description:
    "Download Instagram Reels, Posts, and Stories in HD for free. No watermark, no login required. Fast and easy Instagram video downloader — works on mobile and desktop.",
  keywords: [
    "instagram video downloader",
    "download instagram reels",
    "instagram reel downloader",
    "save instagram video",
    "instagram story downloader",
    "download instagram posts",
    "reels downloader",
    "instavid",
  ],
  openGraph: {
    title: "InstaVid – Free Instagram Video Downloader",
    description:
      "Download Instagram Reels, Posts and Stories in HD. Free, fast, no watermark.",
    url: "https://instavid.online",
    siteName: "InstaVid",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "InstaVid – Free Instagram Video Downloader",
    description:
      "Download Instagram Reels, Posts and Stories in HD. Free, fast, no watermark.",
  },
  alternates: {
    canonical: "https://instavid.online",
  },
  verification: {
    google: "ZSULVEulrO8kNMHS2BtbAempS2UIWWTHrKN39UzldlY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
