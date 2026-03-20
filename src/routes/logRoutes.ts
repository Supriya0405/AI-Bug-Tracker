import { Router } from "express";
import multer from "multer";
import { logService } from "../services/logService";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const logRouter = Router();

logRouter.get("/", (_req, res) => {
  const logs = logService.listLogs();
  res.json({ data: logs });
});

logRouter.get("/:id", (req, res) => {
  const detail = logService.getLogDetail(Number(req.params.id));
  if (!detail) {
    return res.status(404).json({ error: "Log not found" });
  }
  res.json(detail);
});

logRouter.post("/", upload.single("logFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Missing log file" });
  }

  try {
    const result = await logService.processLog(req.file);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: (error as Error).message });
  }
});


