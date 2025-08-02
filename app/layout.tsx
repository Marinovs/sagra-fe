import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Menu - Sagra Antichi Sapori | Pro Loco Gioiese",
  description:
    "Scopri il menu completo della XXVI Edizione della Sagra Antichi Sapori. Piatti tradizionali, sapori autentici e la possibilità di ordinare online!.",
  keywords: [
    "menu sagra",
    "piatti tradizionali",
    "cucina italiana",
    "pro loco gioiese",
    "sagra antichi sapori",
    "ordine online",
    "cibo tradizionale",
    "ristorante",
    "gastronomia",
  ],
  authors: [{ name: "Pro Loco Gioiese" }],
  creator: "Pro Loco Gioiese",
  publisher: "Pro Loco Gioiese",
  openGraph: {
    title: "Menu - Sagra Antichi Sapori",
    description:
      "Scopri il menu completo della XXVI Edizione della Sagra Antichi Sapori con piatti tradizionali e la possibilità di ordinare online.",
    url: "/menu",
    siteName: "Sagra Antichi Sapori",
    images: [
      {
        url: "/images/webp/banner.webp",
        width: 800,
        height: 800,
        alt: "Menu Sagra Antichi Sapori - Pro Loco Gioiese",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu - Sagra Antichi Sapori",
    description:
      "Scopri il menu completo della XXVI Edizione della Sagra Antichi Sapori con piatti tradizionali.",
    images: ["/images/webp/banner.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
