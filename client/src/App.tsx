import { useEffect, useState, type ReactNode } from "react";
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import BugReportIcon from "@mui/icons-material/BugReport";
import HistoryIcon from "@mui/icons-material/History";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";

import type { AnalysisResult, LogSummary } from "./api";
import { fetchLogs, fetchLogDetail, uploadLogFile } from "./api";

function severityChip(severity?: string | null) {
  if (!severity) return null;
  const lower = severity.toLowerCase();
  let color: "error" | "warning" | "success" | "default" = "default";
let icon: ReactNode = null;
  

  if (lower === "critical") {
    color = "error";
    icon = <ErrorIcon fontSize="small" />;
  } else if (lower === "major") {
    color = "warning";
    icon = <WarningIcon fontSize="small" />;
  } else if (lower === "minor") {
    color = "success";
    icon = <CheckCircleIcon fontSize="small" />;
  } else {
    icon = <InfoIcon fontSize="small" />;
  }

  return (
    <Chip
      icon={icon}
      label={severity.toUpperCase()}
      color={color}
      size="small"
      sx={{ ml: 1 }}
    />
  );
}

type DetailState = {
  log: LogSummary & { sanitized?: string };
  analysis: AnalysisResult | null;
  analysisCreatedAt?: string;
};

function App() {
  const [logs, setLogs] = useState<LogSummary[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoadingLogs(true);
      const data = await fetchLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
      setSnackbar("Failed to load upload history");
    } finally {
      setLoadingLogs(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar("File too large. Max 5MB allowed.");
      setFilePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview((reader.result as string) || "");
    };
    reader.readAsText(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setSnackbar("Please choose a log file first.");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadLogFile(selectedFile);
      setSnackbar(
        result.duplicate
          ? "Duplicate log detected. Reused existing analysis."
          : "Log uploaded and analyzed successfully."
      );
      await loadLogs();
      const detailData = await fetchLogDetail(result.logId);
      setDetail(detailData);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.error || "Upload failed";
      setSnackbar(msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleSelectLog(log: LogSummary) {
    setLoadingDetail(true);
    try {
      const data = await fetchLogDetail(log.id);
      setDetail(data);
    } catch (err) {
      console.error(err);
      setSnackbar("Failed to load log details");
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <BugReportIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Bug Tracker — Smart Debug Assistant
          </Typography>
          <IconButton color="inherit" onClick={loadLogs} title="Refresh history">
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Box display="flex" gap={3} flexDirection={{ xs: "column", md: "row" }}>
          {/* Left column: Upload + preview */}
          <Box flex={1} minWidth={0}>
            <Typography variant="h6" gutterBottom>
              Upload Log
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  border: "2px dashed #90caf9",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  bgcolor: "#f5f5f5",
                }}
              >
                <CloudUploadIcon color="primary" fontSize="large" />
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Choose a `.log`, `.txt`, or `.json` file (max 5MB)
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mt: 2 }}
                  startIcon={<CloudUploadIcon />}
                >
                  Select File
                  <input
                    type="file"
                    hidden
                    accept=".log,.txt,.json,text/plain,application/json"
                    onChange={handleFileChange}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: <strong>{selectedFile.name}</strong> (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </Typography>
                )}
              </Box>

              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                  startIcon={
                    uploading ? <CircularProgress size={18} /> : <BugReportIcon />
                  }
                >
                  {uploading ? "Analyzing..." : "Analyze with AI"}
                </Button>
              </Box>

              <Divider />

              <Typography variant="subtitle1">Log Preview</Typography>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 260,
                  overflow: "auto",
                  p: 1.5,
                  fontFamily: "monospace",
                  fontSize: 13,
                  bgcolor: "#0b1020",
                  color: "#e0e0e0",
                }}
              >
                {filePreview ? (
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {filePreview}
                  </pre>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No file preview yet. Select a file to see its content.
                  </Typography>
                )}
              </Paper>
            </Paper>
          </Box>

          {/* Right column: History + analysis */}
          <Box flex={1.2} minWidth={0}>
            <Typography variant="h6" gutterBottom>
              Analysis Dashboard
            </Typography>
            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              gap={2}
            >
              {/* Upload history list */}
              <Paper
                variant="outlined"
                sx={{ flex: 1, minWidth: 0, maxHeight: 420, overflow: "auto" }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  px={2}
                  py={1}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <HistoryIcon fontSize="small" />
                    <Typography variant="subtitle1">Upload History</Typography>
                  </Box>
                  {loadingLogs && (
                    <CircularProgress size={18} color="inherit" />
                  )}
                </Box>
                <Divider />
                <List dense disablePadding>
                  {logs.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No uploads yet." />
                    </ListItem>
                  )}
                  {logs.map((log) => (
                    <ListItem disablePadding key={log.id}>
                      <ListItemButton onClick={() => handleSelectLog(log)}>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <Typography variant="body2">
                                {log.filename}
                              </Typography>
                              {severityChip(log.severity)}
                              {log.cached && (
                                <Chip
                                  label="CACHED"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {new Date(log.uploadedAt).toLocaleString()} •{" "}
                              {(log.sizeBytes / 1024).toFixed(1)} KB •{" "}
                              {log.status.toUpperCase()}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>

              {/* Analysis details */}
              <Paper
                variant="outlined"
                sx={{ flex: 1.2, minWidth: 0, p: 2, maxHeight: 420, overflow: "auto" }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  AI Analysis
                </Typography>
                {loadingDetail && (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    py={4}
                    gap={1}
                  >
                    <CircularProgress size={22} />
                    <Typography variant="body2">
                      Loading analysis...
                    </Typography>
                  </Box>
                )}
                {!loadingDetail && !detail && (
                  <Typography variant="body2" color="text.secondary">
                    Select an item from upload history or upload a new log to see
                    analysis here.
                  </Typography>
                )}
                {!loadingDetail && detail && (
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={600}>
                        {detail.log.filename}
                      </Typography>
                      {severityChip(detail.analysis?.severity)}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Uploaded:{" "}
                      {new Date(detail.log.uploadedAt).toLocaleString()}
                      {detail.analysisCreatedAt &&
                        ` • Analyzed: ${new Date(
                          detail.analysisCreatedAt
                        ).toLocaleString()}`}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {detail.analysis ? (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Issue Type
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {detail.analysis.issueType}
                        </Typography>

                        <Typography variant="subtitle2" gutterBottom>
                          Root Cause
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {detail.analysis.rootCause}
                        </Typography>

                        <Typography variant="subtitle2" gutterBottom>
                          Suggested Fix
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {detail.analysis.suggestedFix}
                        </Typography>

                        {detail.analysis.insights &&
                          detail.analysis.insights.length > 0 && (
                            <>
                              <Typography variant="subtitle2" gutterBottom>
                                Extra Insights
                              </Typography>
                              <List dense>
                                {detail.analysis.insights.map((ins, idx) => (
                                  <ListItem key={idx}>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2">
                                          {ins}
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </>
                          )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No AI analysis available for this log yet.
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </>
  );
}

export default App;