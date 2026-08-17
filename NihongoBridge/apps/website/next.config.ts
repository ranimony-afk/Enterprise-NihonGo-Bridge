import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Image Optimization
  images: {
    formats: ["image/avif", "image/webp"], // Set modern high-compression image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Optimize generated responsive srcsets
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.nihongobridge.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 31536000, // Cache optimized images for 1 year in browser/CDN
  },

  // 2. HTTP Chunk Compression
  compress: true, // Enable Gzip/Brotli compression automatically for all chunks

  // 3. Custom Header Cache Policies
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // Absolute client caching for static media assets
          },
        ],
      },
    ];
  },

  // 4. Webpack Code-Splitting Optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Chunk splitting: Bundle third-party vendors (like drizzle, react, etc) into dedicated cached chunks
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: "all",
            name: "framework",
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module: any) {
              // Generate a safe identifier hash key for chunk segregation
              const cleanId = module.identifier().replace(/[^a-zA-Z0-9]/g, "-").slice(-16);
              return `vendor-${cleanId}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
