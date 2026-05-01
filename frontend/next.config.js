/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker builds
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['lucide-react'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  },
  // Disable source maps in production for smaller bundle size
  productionBrowserSourceMaps: false,
  // Ensure TypeScript path aliases work correctly
  typescript: {
    ignoreBuildErrors: false,
  },
  // Explicitly configure webpack to handle path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
      '@/components': require('path').resolve(__dirname, './src/components'),
      '@/lib': require('path').resolve(__dirname, './src/lib'),
      '@/hooks': require('path').resolve(__dirname, './src/hooks'),
      '@/store': require('path').resolve(__dirname, './src/store'),
      '@/services': require('path').resolve(__dirname, './src/services'),
      '@/schemas': require('path').resolve(__dirname, './src/schemas'),
      '@/types': require('path').resolve(__dirname, './src/types'),
      '@/config': require('path').resolve(__dirname, './src/config'),
      '@/modules': require('path').resolve(__dirname, './src/modules'),
    }
    return config
  },
  turbopack: {},
}

module.exports = nextConfig
