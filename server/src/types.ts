export type AnalysisResult = {
  issueType: string;
  rootCause: string;
  suggestedFix: string;
  severity: "critical" | "major" | "minor" | "info";
  insights?: string[];
};

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


