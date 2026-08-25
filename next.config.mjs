/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained build: .next/standalone carries its own pruned node_modules
  // and server.js, so deploys ship one directory and the runtime needs neither
  // `npm install` nor `next start`.
  output: "standalone",
};

export default nextConfig;
