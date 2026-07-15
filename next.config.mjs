/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages: statis penuh (SSG). Tanpa server runtime.
  output: "export",
  trailingSlash: true,
  images: {
    // Cloudflare Pages tidak menjalankan next/image optimizer.
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
