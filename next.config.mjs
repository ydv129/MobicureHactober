/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // (Removed Vercel-specific configurations)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Headers for security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Proxy /api/python to backend bridge server
  async rewrites() {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:3001";
    return [
      {
        source: "/api/python",
        destination: `${pythonServiceUrl}/api/python`,
      },
    ];
  },
};

export default nextConfig;
