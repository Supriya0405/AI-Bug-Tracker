"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
const hash_1 = require("../utils/hash");
const cacheService_1 = require("./cacheService");
const redactionService_1 = require("./redactionService");
const aiService_1 = require("./aiService");
const similarity_1 = require("../utils/similarity");
const fileValidation_1 = require("../utils/fileValidation");
const uploadDir = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const selectByHash = database_1.db.prepare("SELECT * FROM logs WHERE hash = ?");
const insertLog = database_1.db.prepare(`INSERT INTO logs (filename, original_name, size_bytes, hash, status, storage_path, sanitized)
   VALUES (@filename, @original_name, @size_bytes, @hash, @status, @storage_path, @sanitized)`);
const updateLog = database_1.db.prepare(`UPDATE logs SET status = @status, severity = @severity, issue_type = @issue_type, cached = @cached WHERE id = @id`);
const insertAnalysis = database_1.db.prepare(`INSERT INTO analyses (log_id, issue_type, root_cause, suggested_fix, severity, ai_raw)
   VALUES (@log_id, @issue_type, @root_cause, @suggested_fix, @severity, @ai_raw)`);
const findRecentSanitized = database_1.db.prepare(`SELECT id, sanitized FROM logs WHERE sanitized IS NOT NULL ORDER BY uploaded_at DESC LIMIT 20`);
const toAnalysisResult = (row) => {
    if (!row)
        return null;
    if (row.ai_raw) {
        try {
            return JSON.parse(row.ai_raw);
        }
        catch {
            /* fallthrough */
        }
    }
    return {
        issueType: row.issue_type,
        rootCause: row.root_cause,
        suggestedFix: row.suggested_fix,
        severity: (row.severity || "info"),
        insights: [],
    };
};
exports.logService = {
    validateFile(file) {
        if (!(0, fileValidation_1.isValidFile)(file.originalname, file.mimetype, file.size)) {
            throw new Error("Invalid file. Only .log/.txt/.json <=5MB allowed.");
        }
    },
    async processLog(file) {
        this.validateFile(file);
        const text = file.buffer.toString("utf-8");
        const hash = (0, hash_1.sha256)(text);
        const duplicate = selectByHash.get(hash);
        if (duplicate) {
            const analysisRow = database_1.db
                .prepare("SELECT issue_type, root_cause, suggested_fix, severity, ai_raw, created_at FROM analyses WHERE log_id = ? ORDER BY created_at DESC LIMIT 1")
                .get(duplicate.id);
            const analysis = toAnalysisResult(analysisRow);
            return {
                logId: duplicate.id,
                duplicate: true,
                reusedFrom: duplicate.id,
                analysis,
            };
        }
        const { sanitized, redactions } = (0, redactionService_1.redactSensitiveData)(text);
        const storagePath = path_1.default.join(uploadDir, `${Date.now()}-${file.originalname}`);
        fs_1.default.writeFileSync(storagePath, file.buffer);
        const logId = insertLog.run({
            filename: file.originalname,
            original_name: file.originalname,
            size_bytes: file.size,
            hash,
            status: "processing",
            storage_path: storagePath,
            sanitized,
        }).lastInsertRowid;
        const recent = findRecentSanitized.all();
        const similar = recent.find((row) => (0, similarity_1.isSimilarLog)(row.sanitized || "", sanitized));
        if (similar) {
            const cachedRow = database_1.db
                .prepare("SELECT issue_type, root_cause, suggested_fix, severity, ai_raw, created_at FROM analyses WHERE log_id = ? ORDER BY created_at DESC LIMIT 1")
                .get(similar.id);
            const cachedAnalysis = toAnalysisResult(cachedRow);
            if (cachedAnalysis) {
                insertAnalysis.run({
                    log_id: logId,
                    issue_type: cachedAnalysis.issueType,
                    root_cause: cachedAnalysis.rootCause,
                    suggested_fix: cachedAnalysis.suggestedFix,
                    severity: cachedAnalysis.severity,
                    ai_raw: JSON.stringify(cachedAnalysis),
                });
                updateLog.run({
                    id: logId,
                    status: "completed",
                    severity: cachedAnalysis.severity,
                    issue_type: cachedAnalysis.issueType,
                    cached: 1,
                });
                return {
                    logId,
                    duplicate: false,
                    reusedFrom: similar.id,
                    analysis: cachedAnalysis,
                    redactions,
                };
            }
        }
        const cached = cacheService_1.cacheService.get(hash);
        let analysis;
        if (cached) {
            analysis = cached;
        }
        else {
            analysis = await aiService_1.aiService.analyzeLog(sanitized);
            cacheService_1.cacheService.set(hash, analysis);
        }
        insertAnalysis.run({
            log_id: logId,
            issue_type: analysis.issueType,
            root_cause: analysis.rootCause,
            suggested_fix: analysis.suggestedFix,
            severity: analysis.severity,
            ai_raw: JSON.stringify(analysis),
        });
        updateLog.run({
            id: logId,
            status: "completed",
            severity: analysis.severity,
            issue_type: analysis.issueType,
            cached: cached ? 1 : 0,
        });
        return { logId, analysis, redactions };
    },
    listLogs() {
        const rows = database_1.db
            .prepare(`SELECT id, filename, size_bytes, uploaded_at, status, severity, issue_type, cached
         FROM logs ORDER BY uploaded_at DESC LIMIT 50`)
            .all();
        return rows.map((row) => ({
            id: row.id,
            filename: row.filename,
            sizeBytes: row.size_bytes,
            uploadedAt: row.uploaded_at,
            status: row.status,
            severity: row.severity ?? null,
            issueType: row.issue_type ?? null,
            cached: Boolean(row.cached),
        }));
    },
    getLogDetail(id) {
        const log = database_1.db
            .prepare("SELECT * FROM logs WHERE id = ?")
            .get(id);
        if (!log)
            return null;
        const analysisRow = database_1.db
            .prepare("SELECT issue_type, root_cause, suggested_fix, severity, ai_raw, created_at FROM analyses WHERE log_id = ? ORDER BY created_at DESC LIMIT 1")
            .get(id);
        return {
            log,
            analysis: toAnalysisResult(analysisRow),
            analysisCreatedAt: analysisRow?.created_at,
        };
    },
};
//# sourceMappingURL=logService.js.map