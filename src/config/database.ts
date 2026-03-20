import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { env } from "./env";

const dbDir = path.dirname(env.sqlitePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(env.sqlitePath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT,
    size_bytes INTEGER NOT NULL,
    hash TEXT NOT NULL UNIQUE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL,
    severity TEXT,
    issue_type TEXT,
    storage_path TEXT,
    cached BOOLEAN DEFAULT 0,
    sanitized TEXT
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id INTEGER NOT NULL,
    issue_type TEXT,
    root_cause TEXT,
    suggested_fix TEXT,
    severity TEXT,
    ai_raw TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_id) REFERENCES logs(id)
  );
`);

export type LogRecord = {
  id: number;
  filename: string;
  original_name: string | null;
  size_bytes: number;
  hash: string;
  uploaded_at: string;
  status: string;
  severity?: string | null;
  issue_type?: string | null;
  storage_path?: string | null;
  cached?: number;
};

