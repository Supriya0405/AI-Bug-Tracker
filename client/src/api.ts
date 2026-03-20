import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend base URL
});

export type Severity = "critical" | "major" | "minor" | "info";

export type LogSummary = {
  id: number;
  filename: string;
  sizeBytes: number;
  uploadedAt: string;
  status: string;
  severity?: string | null;
  issueType?: string | null;
  cached?: boolean;
};

export type AnalysisResult = {
  issueType: string;
  rootCause: string;
  suggestedFix: string;
  severity: Severity;
  insights?: string[];
};

export async function fetchLogs() {
  const res = await api.get<{ data: LogSummary[] }>("/logs");
  return res.data.data;
}

export async function fetchLogDetail(id: number) {
  const res = await api.get(`/logs/${id}`);
  return res.data as {
    log: LogSummary & { sanitized?: string };
    analysis: AnalysisResult | null;
    analysisCreatedAt?: string;
  };
}

export async function uploadLogFile(file: File) {
  const formData = new FormData();
  formData.append("logFile", file);
  const res = await api.post("/logs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data as {
    logId: number;
    duplicate?: boolean;
    reusedFrom?: number;
    analysis?: AnalysisResult | null;
    redactions?: Record<string, number>;
  };
}