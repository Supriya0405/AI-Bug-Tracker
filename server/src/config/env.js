"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const required = ["OPENAI_API_KEY"];
required.forEach((key) => {
    if (!process.env[key]) {
        console.warn(`[env] Missing required environment variable: ${key}`);
    }
});
exports.env = {
    port: Number(process.env.PORT) || 5000,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    openAiKey: process.env.OPENAI_API_KEY || "",
    sqlitePath: process.env.SQLITE_PATH ||
        `${process.cwd()}/data/bugtracker.sqlite`, // ensures consistent path
    cacheTtlMs: Number(process.env.CACHE_TTL_MS) || 1000 * 60 * 30, // 30 mins
};
//# sourceMappingURL=env.js.map