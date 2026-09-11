import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // O catálogo e o motor são TypeScript puro dentro do monorepo.
  transpilePackages: ['@prospere/content', '@prospere/engine'],
};

export default nextConfig;
