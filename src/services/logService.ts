import fs from "fs";
import path from "path";
import { db } from "../config/database";
import { sha256 } from "../utils/hash";
import { cacheService } from "./cacheService";
import { redactSensitiveData } from "./redactionService";
import { aiService } from "./aiService";
import type { AnalysisResult, LogSummary } from "../types";
import { isSimilarLog } from "../utils/similarity";
import { isValidFile } from "../utils/fileValidation";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const selectByHash = db.prepare("SELECT * FROM logs WHERE hash = ?");
const insertLog = db.prepare(
  `INSERT INTO logs (filename, original_name, size_bytes, hash, status, storage_path, sanitized)
   VALUES (@filename, @original_name, @size_bytes, @hash, @status, @storage_path, @sanitized)`
);
const updateLog = db.prepare(
  `UPDATE logs SET status = @status, severity = @severity, issue_type = @issue_type, cached = @cached WHERE id = @id`
);
const insertAnalysis = db.prepare(
  `INSERT INTO analyses (log_id, issue_type, root_cause, suggested_fix, severity, ai_raw)
   VALUES (@log_id, @issue_type, @root_cause, @suggested_fix, @severity, @ai_raw)`
);

const findRecentSanitized = db.prepare(
  `SELECT id, sanitized FROM logs WHERE sanitized IS NOT NULL ORDER BY uploaded_at DESC LIMIT 20`
);

type LogRow = {
  id: number;
  filename: string;
  size_bytes: number;
  uploaded_at: string;
  status: string;
  severity?: string;
  issue_type?: string;
  cached?: number;
};

type StoredLogRow = LogRow & { sanitized?: string };

type AnalysisRow = {
  issue_type: string;
  root_cause: string;
  suggested_fix: string;
  severity: string;
  ai_raw: string;
  created_at: string;
};

const toAnalysisResult = (row: AnalysisRow | undefined): AnalysisResult | null => {
  if (!row) return null;
  if (row.ai_raw) {
    try {
      return JSON.parse(row.ai_raw) as AnalysisResult;
    } catch {
      /* fallthrough */
    }
  }
  return {
    issueType: row.issue_type,
    rootCause: row.root_cause,
    suggestedFix: row.suggested_fix,
    severity: (row.severity || "info") as AnalysisResult["severity"],
    insights: [],
  };
};

export const logService = {
  validateFile(file: Express.Multer.File) {
    if (!isValidFile(file.originalname, file.mimetype, file.size)) {
      throw new Error("Invalid file. Only .log/.txt/.json <=5MB allowed.");
    }
  },

  async processLog(file: Express.Multer.File) {
    this.validateFile(file);

    const text = file.buffer.toString("utf-8");
    const hash = sha256(text);
    const duplicate = selectByHash.get(hash) as StoredLogRow | undefined;
    if (duplicate) {
      const analysisRow = db
        .prepare(
          "SELECT issue_type, root_cause, suggested_fix, severity, ai_raw, created_at FROM analyses WHERE log_id = ? ORDER BY created_at DESC LIMIT 1"
        )
        .get(duplicate.id) as AnalysisRow | undefined;
      const analysis = toAnalysisResult(analysisRow);
      return {
        logId: duplicate.id,
        duplicate: true,
        reusedFrom: duplicate.id,
        analysis,
      };
    }

    const { sanitized, redactions } = redactSensitiveData(text);
    const storagePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
    fs.writeFileSync(storagePath, file.buffer);

    const logId = insertLog.run({
      filename: file.originalname,
      original_name: file.originalname,
      size_bytes: file.size,
      hash,
      status: "processing",
      storage_path: storagePath,
      sanitized,
    }).lastInsertRowid as number;

    const recent = findRecentSanitized.all() as { id: number; sanitized: string }[];
    const similar = recent.find((row) => isSimilarLog(row.sanitized || "", sanitized));
    if (similar) {
      const cachedRow = db
        .prepare(
          "SELECT issue_type, root_cause, suggested_fix, severity, ai_raw, created_at FROM analyses WHERE log_id = ? ORDER BY created_at DESC LIMIT 1"
        )
        .get(similar.id) as AnalysisRow | undefined;
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

    const cached = cacheService.get(hash);
    let analysis: AnalysisResult;
    if (cached) {
      analysis = cached;
    } else {
      analysis = await aiService.analyzeLog(sanitized);
      cacheService.set(hash, analysis);
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

  listLogs(): LogSummary[] {
    const rows = db
      .prepare(
        `SELECT id, filename, size_bytes, uploaded_at, status, severity, issue_type, cached
         FROM logs ORDER BY uploaded_at DESC LIMIT 50`
      )
      .all() as LogRow[];

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

  getLogDetail(id: number) {
    const log = db
      .prepare("SELECT * FROM logs WHERE id = ?")
      .get(id) as (LogSummary & { sanitized?: string }) | undefined;
    if (!log) return null;

    const analysisRow = db
      .prepare(
        "SELECT issue_type, root_cause, suggested_fix, severity, ai_raw, created_at FROM analyses WHERE log_id = ? ORDER BY created_at DESC LIMIT 1"
      )
      .get(id) as AnalysisRow | undefined;

    return {
      log,
      analysis: toAnalysisResult(analysisRow),
      analysisCreatedAt: analysisRow?.created_at,
    };
  },
};

