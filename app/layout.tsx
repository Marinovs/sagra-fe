import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import {
  generateOpenGraphMetadata,
  generateTwitterMetadata,
  commonMetadata,
} from "@/lib/metadata";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Menu - Sagra Antichi Sapori | Pro Loco Gioiese",
  description:
    "Scopri il menu completo della XXVI Edizione della Sagra Antichi Sapori. Piatti tradizionali, sapori autentici e la possibilità di ordinare online!.",
  ...commonMetadata,
  openGraph: generateOpenGraphMetadata(
    "Menu - Sagra Antichi Sapori",
    "Scopri il menu completo della XXVI Edizione della Sagra Antichi Sapori con piatti tradizionali e la possibilità di ordinare online.",
    "/menu"
  ),
  twitter: generateTwitterMetadata(
    "Menu - Sagra Antichi Sapori",
    "Scopri il menu completo della XXVI Edizione della Sagra Antichi Sapori con piatti tradizionali."
  ),
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
