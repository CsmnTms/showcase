import type { NextConfig } from "next";
const isProjectPage = false; // set true if deploying to https://<user>.github.io/<repo>
const repo = 'showcase';    // your repo name

const nextConfig: NextConfig = {
  output: 'export', // enables static export
  images: { unoptimized: true }, // required for next/image on static hosts
  basePath: isProjectPage ? `/${repo}` : undefined,
  assetPrefix: isProjectPage ? `/${repo}/` : undefined, // comment for local testing
  trailingSlash: true, // safer for GH Pages (serves index.html in folders)
  reactCompiler: true,
};

export default nextConfig;
