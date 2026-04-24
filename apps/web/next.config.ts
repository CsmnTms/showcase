import type { NextConfig } from "next";
const isProjectPage = true;
const repo = 'showcase';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isProjectPage ? `/${repo}` : undefined,
  assetPrefix: isProjectPage ? `/${repo}/` : undefined,
  trailingSlash: true,
  reactCompiler: true,
};

export default nextConfig;
