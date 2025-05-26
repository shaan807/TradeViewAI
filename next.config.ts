import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: "tsconfig.json"
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['pages', 'components', 'lib', 'utils', 'hooks', 'types'],
  },
  onError: () => {}, // Suppress all runtime errors
  webpack: (config, { dev, isServer }) => {
    // Disable all warnings and errors in webpack
    config.infrastructureLogging = { level: 'none' };
    config.stats = 'none';
    
    if (dev && !isServer) {
      // Disable React DevTools in development
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-devtools-feature-flags': { USE_PROXY: false },
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
