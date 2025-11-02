import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/api/parse": ["./node_modules/@napi-rs/canvas/**"],
  },
};

export default nextConfig;
