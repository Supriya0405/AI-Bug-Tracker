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
  ListItemText,
  Paper,
  Snackbar,
  Toolbar,
  Typography,
  Card,
  CardContent,
  Avatar,
  Fade,
  Slide,
  Zoom,
  Fab,
  alpha,
  LinearProgress,
  Alert,
  Tooltip,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import BugReportIcon from "@mui/icons-material/BugReport";
import HistoryIcon from "@mui/icons-material/History";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SpeedIcon from "@mui/icons-material/Speed";
import AnalyticsIcon from "@mui/icons-material/Analytics";

import type { AnalysisResult, LogSummary } from "./api";
import { fetchLogs, fetchLogDetail, uploadLogFile } from "./api";

function severityChip(severity?: string | null) {
  if (!severity) return null;
  const lower = severity.toLowerCase();
  let icon: ReactNode = null;
  let backgroundColor: string = "";
  let textColor: string = "";

  if (lower === "critical") {
    icon = <ErrorIcon fontSize="small" />;
    backgroundColor = "#ffebee";
    textColor = "#c62828";
  } else if (lower === "major") {
    icon = <WarningIcon fontSize="small" />;
    backgroundColor = "#fff8e1";
    textColor = "#f57c00";
  } else if (lower === "minor") {
    icon = <CheckCircleIcon fontSize="small" />;
    backgroundColor = "#e8f5e8";
    textColor = "#2e7d32";
  } else {
    icon = <InfoIcon fontSize="small" />;
    backgroundColor = "#e3f2fd";
    textColor = "#1565c0";
  }

  return (
    <Chip
      icon={icon}
      label={severity.toUpperCase()}
      sx={{
        ml: 1,
        backgroundColor,
        color: textColor,
        fontWeight: 600,
        fontSize: "0.75rem",
        "& .MuiChip-icon": {
          color: textColor,
        },
        animation: "pulse 2s infinite",
      }}
      size="small"
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
      <AppBar 
        position="static" 
        sx={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <Avatar 
            sx={{ 
              mr: 2, 
              bgcolor: alpha("#fff", 0.2),
              backdropFilter: "blur(10px)",
            }}
          >
            <BugReportIcon />
          </Avatar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            AI Bug Tracker — Smart Debug Assistant
          </Typography>
          <Tooltip title="Refresh history">
            <IconButton 
              color="inherit" 
              onClick={loadLogs}
              sx={{ 
                bgcolor: alpha("#fff", 0.1),
                "&:hover": { bgcolor: alpha("#fff", 0.2) }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 2 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4, justifyContent: "center" }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                transform: "translateY(0)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {logs.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Logs
                    </Typography>
                  </Box>
                  <AnalyticsIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                transform: "translateY(0)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {logs.filter(l => l.severity === "critical").length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Critical Issues
                    </Typography>
                  </Box>
                  <ErrorIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                transform: "translateY(0)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {logs.filter(l => l.cached).length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Cached Results
                    </Typography>
                  </Box>
                  <SpeedIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                color: "white",
                transform: "translateY(0)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {logs.filter(l => l.status === "completed").length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Completed
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} justifyContent="center">
          {/* Left column: Upload + preview */}
          <Grid item xs={12} lg={5}>
            <Fade in timeout={800}>
              <Card 
                sx={{ 
                  height: "100%",
                  background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <Avatar sx={{ bgcolor: "#667eea", mr: 2 }}>
                      <CloudUploadIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight={600}>
                      Upload Log File
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      border: "3px dashed #667eea",
                      borderRadius: 3,
                      p: 4,
                      textAlign: "center",
                      background: "linear-gradient(145deg, #f8f9ff 0%, #e8ecff 100%)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        borderColor: "#764ba2",
                        background: "linear-gradient(145deg, #f0f2ff 0%, #e0e6ff 100%)",
                        transform: "scale(1.02)",
                      },
                    }}
                  >
                    <input
                      type="file"
                      accept=".log,.txt,.json,text/plain,application/json"
                      onChange={handleFileChange}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0.0001,
                        cursor: "pointer",
                        zIndex: 1,
                      }}
                    />
                    <Zoom in timeout={600}>
                      <Avatar 
                        sx={{ 
                          bgcolor: "#667eea", 
                          mx: "auto", 
                          mb: 2,
                          width: 64,
                          height: 64,
                          position: "relative",
                          zIndex: 0,
                        }}
                      >
                        <CloudUploadIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Zoom>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ position: "relative", zIndex: 0 }}>
                      Drop your log file here
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, position: "relative", zIndex: 0 }}>
                      Supports .log, .txt, .json files (max 5MB)
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        position: "relative",
                        zIndex: 0,
                        pointerEvents: "none",
                      }}
                    >
                      Browse Files
                    </Button>
                    {selectedFile && (
                      <Fade in timeout={300}>
                        <Box mt={2} sx={{ position: "relative", zIndex: 0 }}>
                          <Alert severity="success" sx={{ borderRadius: 2 }}>
                            <Typography variant="body2">
                              <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </Typography>
                          </Alert>
                        </Box>
                      </Fade>
                    )}
                  </Box>

                  <Box mt={3} display="flex" justifyContent="center">
                    <Fab
                      variant="extended"
                      color="primary"
                      onClick={handleUpload}
                      disabled={uploading || !selectedFile}
                      sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        px: 4,
                        "&:disabled": {
                          background: "#e0e0e0",
                        }
                      }}
                    >
                      {uploading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <PsychologyIcon sx={{ mr: 1 }} />
                          Analyze with AI
                        </>
                      )}
                    </Fab>
                  </Box>

                  {filePreview && (
                    <Box mt={3}>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
                        Log Preview
                      </Typography>
                      <Paper
                        sx={{
                          maxHeight: 200,
                          overflow: "auto",
                          p: 2,
                          fontFamily: "monospace",
                          fontSize: 12,
                          background: "#1a1a2e",
                          color: "#eee",
                          borderRadius: 2,
                          "&::-webkit-scrollbar": {
                            width: 8,
                          },
                          "&::-webkit-scrollbar-track": {
                            background: "#2a2a3e",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            background: "#667eea",
                            borderRadius: 4,
                          },
                        }}
                      >
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                          {filePreview}
                        </pre>
                      </Paper>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Right column: History + analysis */}
          <Grid item xs={12} lg={7}>
            <Fade in timeout={1000}>
              <Box>
                <Typography variant="h5" fontWeight={600} mb={2} textAlign="center">
                  Analysis Dashboard
                </Typography>
                <Grid container spacing={2} justifyContent="center">
                  {/* Upload history list */}
                  <Grid item xs={12} md={5}>
                    <Card 
                      sx={{ 
                        height: 500,
                        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        borderRadius: 3,
                      }}
                    >
                      <CardContent sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ bgcolor: "#667eea", width: 32, height: 32 }}>
                              <HistoryIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6" fontWeight={600}>
                              Upload History
                            </Typography>
                          </Box>
                          {loadingLogs && <CircularProgress size={20} />}
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                          {logs.length === 0 ? (
                            <Box 
                              display="flex" 
                              flexDirection="column" 
                              alignItems="center" 
                              justifyContent="center"
                              height="100%"
                              color="text.secondary"
                            >
                              <HistoryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                              <Typography variant="body2">
                                No uploads yet
                              </Typography>
                            </Box>
                          ) : (
                            <List disablePadding>
                              {logs.map((log, index) => (
                                <Slide in timeout={300 + index * 50} direction="right" key={log.id}>
                                  <Card 
                                    sx={{ 
                                      mb: 1, 
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                      "&:hover": {
                                        transform: "translateX(5px)",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                      }
                                    }}
                                    onClick={() => handleSelectLog(log)}
                                  >
                                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                      <Box display="flex" alignItems="center" mb={1}>
                                        <Typography variant="body2" fontWeight={500} sx={{ flexGrow: 1, mr: 1 }}>
                                          {log.filename}
                                        </Typography>
                                        {severityChip(log.severity)}
                                      </Box>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        {log.cached && (
                                          <Chip
                                            label="CACHED"
                                            size="small"
                                            sx={{
                                              bgcolor: "#e8f5e8",
                                              color: "#2e7d32",
                                              fontSize: "0.7rem",
                                              fontWeight: 600,
                                            }}
                                          />
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                          {new Date(log.uploadedAt).toLocaleDateString()}
                                        </Typography>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </Slide>
                              ))}
                            </List>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Analysis details */}
                  <Grid item xs={12} md={7}>
                    <Card 
                      sx={{ 
                        height: 500,
                        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        borderRadius: 3,
                      }}
                    >
                      <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar sx={{ bgcolor: "#667eea" }}>
                            <PsychologyIcon />
                          </Avatar>
                          <Typography variant="h6" fontWeight={600}>
                            AI Analysis
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                          {loadingDetail && (
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              justifyContent="center"
                              height="100%"
                              gap={2}
                            >
                              <CircularProgress size={40} />
                              <Typography variant="body2" color="text.secondary">
                                Analyzing with AI...
                              </Typography>
                              <LinearProgress sx={{ width: "60%" }} />
                            </Box>
                          )}
                          
                          {!loadingDetail && !detail && (
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              justifyContent="center"
                              height="100%"
                              color="text.secondary"
                            >
                              <PsychologyIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                              <Typography variant="body2" textAlign="center">
                                Select a log from history or upload a new file to see AI analysis
                              </Typography>
                            </Box>
                          )}
                          
                          {!loadingDetail && detail && (
                            <Fade in timeout={500}>
                              <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                  <Typography variant="h6" fontWeight={600}>
                                    {detail.log.filename}
                                  </Typography>
                                  {severityChip(detail.analysis?.severity)}
                                </Box>
                                
                                <Typography variant="caption" color="text.secondary" mb={3} display="block">
                                  Uploaded: {new Date(detail.log.uploadedAt).toLocaleString()}
                                  {detail.analysisCreatedAt &&
                                    ` • Analyzed: ${new Date(detail.analysisCreatedAt).toLocaleString()}`
                                  }
                                </Typography>

                                {detail.analysis ? (
                                  <>
                                    <Card sx={{ mb: 2, bgcolor: "#f8f9ff", borderRadius: 2 }}>
                                      <CardContent sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                                          Issue Type
                                        </Typography>
                                        <Typography variant="body2">
                                          {detail.analysis.issueType}
                                        </Typography>
                                      </CardContent>
                                    </Card>

                                    <Card sx={{ mb: 2, bgcolor: "#fff8f8", borderRadius: 2 }}>
                                      <CardContent sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" fontWeight={600} color="error" gutterBottom>
                                          Root Cause
                                        </Typography>
                                        <Typography variant="body2">
                                          {detail.analysis.rootCause}
                                        </Typography>
                                      </CardContent>
                                    </Card>

                                    <Card sx={{ mb: 2, bgcolor: "#f8fff8", borderRadius: 2 }}>
                                      <CardContent sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" fontWeight={600} color="success" gutterBottom>
                                          Suggested Fix
                                        </Typography>
                                        <Typography variant="body2">
                                          {detail.analysis.suggestedFix}
                                        </Typography>
                                      </CardContent>
                                    </Card>

                                    {detail.analysis.insights && detail.analysis.insights.length > 0 && (
                                      <Card sx={{ bgcolor: "#f0f8ff", borderRadius: 2 }}>
                                        <CardContent sx={{ p: 2 }}>
                                          <Typography variant="subtitle2" fontWeight={600} color="info" gutterBottom>
                                            Additional Insights
                                          </Typography>
                                          <List dense>
                                            {detail.analysis.insights.map((ins, idx) => (
                                              <ListItem key={idx} sx={{ py: 0.5 }}>
                                                <ListItemText
                                                  primary={
                                                    <Typography variant="body2">
                                                      • {ins}
                                                    </Typography>
                                                  }
                                                />
                                              </ListItem>
                                            ))}
                                          </List>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </>
                                ) : (
                                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    No AI analysis available for this log yet.
                                  </Alert>
                                )}
                              </Box>
                            </Fade>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setSnackbar(null)} 
          severity="success" 
          sx={{ borderRadius: 2 }}
        >
          {snackbar}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;