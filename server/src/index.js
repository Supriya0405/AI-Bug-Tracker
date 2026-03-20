"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const logRoutes_1 = require("./routes/logRoutes");
const app = (0, express_1.default)();
// Allow all localhost ports in dev (so Vite can use 5173, 5176, etc.)
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            // allow tools like curl / Postman
            return callback(null, true);
        }
        if (origin.startsWith("http://localhost")) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
}));
app.use(express_1.default.json({ limit: "2mb" }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});
app.use("/api/logs", logRoutes_1.logRouter);
// Global error handler
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});
exports.default = app;
//# sourceMappingURL=index.js.map