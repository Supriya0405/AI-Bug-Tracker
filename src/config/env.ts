import dotenv from "dotenv";

dotenv.config();

const required = ["OPENAI_API_KEY"] as const;

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[env] Missing required environment variable: ${key}`);
  }
});

export const env = {
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  openAiKey: process.env.OPENAI_API_KEY || "",
  sqlitePath:
    process.env.SQLITE_PATH ||
    `${process.cwd()}/data/bugtracker.sqlite`, // ensures consistent path
  cacheTtlMs: Number(process.env.CACHE_TTL_MS) || 1000 * 60 * 30, // 30 mins
};


