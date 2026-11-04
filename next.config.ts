import type { NextConfig } from "next";

// Exportação estática: o site vira HTML/CSS/JS puro servido pelo Cloudflare Workers (./out).
// O Worker (worker/index.js) só cuida da raiz: redireciona para /en/.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
