import type { NextConfig } from "next"
import path from "node:path"

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't walk up to $HOME looking for a
  // lockfile (there is one there, which broke module resolution).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Allow the LAN address to reach dev resources (HMR) while developing.
  allowedDevOrigins: ["192.168.15.30"],
}

export default nextConfig
