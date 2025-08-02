import type { Metadata } from "next";

// Get the base URL from environment variables
export const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback for development
  return "http://localhost:3000";
};

// Generate Open Graph metadata with absolute URLs
export const generateOpenGraphMetadata = (
  title: string,
  description: string,
  path: string = "",
  imagePath: string = "/images/webp/banner.webp"
): Metadata["openGraph"] => {
  const baseUrl = getBaseUrl();

  return {
    title,
    description,
    url: `${baseUrl}${path}`,
    siteName: "Sagra Antichi Sapori",
    images: [
      {
        url: `${baseUrl}${imagePath}`,
        width: 1200,
        height: 630,
        alt: `${title} - Pro Loco Gioiese`,
        type: "image/webp",
      },
    ],
    locale: "it_IT",
    type: "website",
  };
};

// Generate Twitter metadata with absolute URLs
export const generateTwitterMetadata = (
  title: string,
  description: string,
  imagePath: string = "/images/webp/banner.webp"
): Metadata["twitter"] => {
  const baseUrl = getBaseUrl();

  return {
    card: "summary_large_image",
    title,
    description,
    images: [`${baseUrl}${imagePath}`],
  };
};

// Common metadata for the entire app
export const commonMetadata = {
  authors: [{ name: "Pro Loco Gioiese" }],
  creator: "Pro Loco Gioiese",
  publisher: "Pro Loco Gioiese",
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
};
