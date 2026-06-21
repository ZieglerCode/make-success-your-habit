import path from "node:path";
import {withPayload} from "@payloadcms/next/withPayload";
import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/en/:path+",
        destination: "/:path+",
      },
      {
        source: "/de/:path+",
        destination: "/:path+",
      },
    ];
  },
};

export default withPayload(nextConfig, {devBundleServerPackages: false});
