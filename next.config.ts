import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 关闭 Cache Components/PPR，回归传统动态渲染（电商页面依赖 searchParams/session/DB）
  cacheComponents: false,
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
