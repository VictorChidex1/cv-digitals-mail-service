import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16 writes an AGENTS.md into the app directory on every dev run.
  // The governing rules for this project live in .agents/rules/; a second,
  // auto-generated instruction file would compete with them.
  agentRules: false,
  // The floating dev badge obscures the sidebar footer and mobile content.
  devIndicators: false,
};

export default nextConfig;
