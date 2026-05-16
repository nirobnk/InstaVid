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
    canonical: "https://instavid.online/",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "InstaVid",
                url: "https://instavid.online/",
                description:
                  "Free Instagram video downloader. Download Instagram Reels, Posts and Stories in HD with no watermark and no login required.",
                applicationCategory: "MultimediaApplication",
                operatingSystem: "Any",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                featureList: [
                  "Download Instagram Reels",
                  "Download Instagram Posts",
                  "Download Instagram Stories",
                  "HD video quality",
                  "No watermark",
                  "No login required",
                  "Free to use",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "How do I download Instagram Reels?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Copy the Instagram Reel URL, paste it into InstaVid, click Fetch Video, then click Download MP4. The video saves to your device in HD.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Is InstaVid free to use?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes, InstaVid is completely free. No account, no subscription, and no hidden fees.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does InstaVid add a watermark?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "No. All downloads are clean HD MP4 files with no watermark added.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What types of Instagram content can I download?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "InstaVid supports Instagram Reels, Posts (photos and videos), and Stories.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Does InstaVid work on mobile?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. InstaVid works on iPhone, Android, and any desktop browser — no app install needed.",
                    },
                  },
                ],
              },
            ]),
          }}
        />
        {children}
      </body>
    </html>
  );
}
