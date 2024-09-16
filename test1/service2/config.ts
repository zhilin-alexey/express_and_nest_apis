import { createConfig } from "express-zod-api";

const config = createConfig({
  server: {
    listen: process.env.SERVE_PORT || 3001
  },
  cors: true,
  logger: { level: "info", color: true },
  startupLogo: false
});

export default config;
