import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { logRouter } from "./routes/logRoutes";

const app = express();

// Allow all localhost ports in dev (so Vite can use 5173, 5176, etc.)
app.use(
  cors({
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
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(helmet());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/logs", logRouter);

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
);

export default app;
