"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const logService_1 = require("../services/logService");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
exports.logRouter = (0, express_1.Router)();
exports.logRouter.get("/", (_req, res) => {
    const logs = logService_1.logService.listLogs();
    res.json({ data: logs });
});
exports.logRouter.get("/:id", (req, res) => {
    const detail = logService_1.logService.getLogDetail(Number(req.params.id));
    if (!detail) {
        return res.status(404).json({ error: "Log not found" });
    }
    res.json(detail);
});
exports.logRouter.post("/", upload.single("logFile"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Missing log file" });
    }
    try {
        const result = await logService_1.logService.processLog(req.file);
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});
//# sourceMappingURL=logRoutes.js.map