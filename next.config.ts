/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Add image optimization settings
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },
  experimental: {
    // Enable additional optimizations
    optimizePackageImports: ["@/components", "@/lib"],
  },
  // Enable compression
  compress: true,
  // Optimize bundle splitting
  webpack: (config: any) => {
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          name: "vendors",
          priority: 10,
          enforce: true,
        },
      },
    };
    return config;
  },
};

export default nextConfig;
