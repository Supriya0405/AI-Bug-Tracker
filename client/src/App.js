"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const material_1 = require("@mui/material");
const CloudUpload_1 = __importDefault(require("@mui/icons-material/CloudUpload"));
const BugReport_1 = __importDefault(require("@mui/icons-material/BugReport"));
const History_1 = __importDefault(require("@mui/icons-material/History"));
const Refresh_1 = __importDefault(require("@mui/icons-material/Refresh"));
const CheckCircle_1 = __importDefault(require("@mui/icons-material/CheckCircle"));
const Warning_1 = __importDefault(require("@mui/icons-material/Warning"));
const Error_1 = __importDefault(require("@mui/icons-material/Error"));
const Info_1 = __importDefault(require("@mui/icons-material/Info"));
const Psychology_1 = __importDefault(require("@mui/icons-material/Psychology"));
const Speed_1 = __importDefault(require("@mui/icons-material/Speed"));
const Analytics_1 = __importDefault(require("@mui/icons-material/Analytics"));
const api_1 = require("./api");
function severityChip(severity) {
    if (!severity)
        return null;
    const lower = severity.toLowerCase();
    let icon = null;
    let backgroundColor = "";
    let textColor = "";
    if (lower === "critical") {
        icon = <Error_1.default fontSize="small"/>;
        backgroundColor = "#ffebee";
        textColor = "#c62828";
    }
    else if (lower === "major") {
        icon = <Warning_1.default fontSize="small"/>;
        backgroundColor = "#fff8e1";
        textColor = "#f57c00";
    }
    else if (lower === "minor") {
        icon = <CheckCircle_1.default fontSize="small"/>;
        backgroundColor = "#e8f5e8";
        textColor = "#2e7d32";
    }
    else {
        icon = <Info_1.default fontSize="small"/>;
        backgroundColor = "#e3f2fd";
        textColor = "#1565c0";
    }
    return (<material_1.Chip icon={icon} label={severity.toUpperCase()} sx={{
            ml: 1,
            backgroundColor,
            color: textColor,
            fontWeight: 600,
            fontSize: "0.75rem",
            "& .MuiChip-icon": {
                color: textColor,
            },
            animation: "pulse 2s infinite",
        }} size="small"/>);
}
function App() {
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [loadingLogs, setLoadingLogs] = (0, react_1.useState)(false);
    const [selectedFile, setSelectedFile] = (0, react_1.useState)(null);
    const [filePreview, setFilePreview] = (0, react_1.useState)("");
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [detail, setDetail] = (0, react_1.useState)(null);
    const [loadingDetail, setLoadingDetail] = (0, react_1.useState)(false);
    const [snackbar, setSnackbar] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        loadLogs();
    }, []);
    async function loadLogs() {
        try {
            setLoadingLogs(true);
            const data = await (0, api_1.fetchLogs)();
            setLogs(data);
        }
        catch (err) {
            console.error(err);
            setSnackbar("Failed to load upload history");
        }
        finally {
            setLoadingLogs(false);
        }
    }
    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setSelectedFile(file);
        if (file.size > 5 * 1024 * 1024) {
            setSnackbar("File too large. Max 5MB allowed.");
            setFilePreview("");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setFilePreview(reader.result || "");
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
            const result = await (0, api_1.uploadLogFile)(selectedFile);
            setSnackbar(result.duplicate
                ? "Duplicate log detected. Reused existing analysis."
                : "Log uploaded and analyzed successfully.");
            await loadLogs();
            const detailData = await (0, api_1.fetchLogDetail)(result.logId);
            setDetail(detailData);
        }
        catch (err) {
            console.error(err);
            const msg = err?.response?.data?.error || "Upload failed";
            setSnackbar(msg);
        }
        finally {
            setUploading(false);
        }
    }
    async function handleSelectLog(log) {
        setLoadingDetail(true);
        try {
            const data = await (0, api_1.fetchLogDetail)(log.id);
            setDetail(data);
        }
        catch (err) {
            console.error(err);
            setSnackbar("Failed to load log details");
        }
        finally {
            setLoadingDetail(false);
        }
    }
    return (<>
      <material_1.CssBaseline />
      <material_1.AppBar position="static" sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}>
        <material_1.Toolbar>
          <material_1.Avatar sx={{
            mr: 2,
            bgcolor: (0, material_1.alpha)("#fff", 0.2),
            backdropFilter: "blur(10px)",
        }}>
            <BugReport_1.default />
          </material_1.Avatar>
          <material_1.Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            AI Bug Tracker — Smart Debug Assistant
          </material_1.Typography>
          <material_1.Tooltip title="Refresh history">
            <material_1.IconButton color="inherit" onClick={loadLogs} sx={{
            bgcolor: (0, material_1.alpha)("#fff", 0.1),
            "&:hover": { bgcolor: (0, material_1.alpha)("#fff", 0.2) }
        }}>
              <Refresh_1.default />
            </material_1.IconButton>
          </material_1.Tooltip>
        </material_1.Toolbar>
      </material_1.AppBar>

      <material_1.Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 2 }}>
        {/* Stats Cards */}
        <material_1.Grid container spacing={3} sx={{ mb: 4, justifyContent: "center" }}>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.Card sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            transform: "translateY(0)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }
        }}>
              <material_1.CardContent>
                <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
                  <material_1.Box>
                    <material_1.Typography variant="h4" fontWeight="bold">
                      {logs.length}
                    </material_1.Typography>
                    <material_1.Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Logs
                    </material_1.Typography>
                  </material_1.Box>
                  <Analytics_1.default sx={{ fontSize: 40, opacity: 0.7 }}/>
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.Card sx={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            transform: "translateY(0)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }
        }}>
              <material_1.CardContent>
                <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
                  <material_1.Box>
                    <material_1.Typography variant="h4" fontWeight="bold">
                      {logs.filter(l => l.severity === "critical").length}
                    </material_1.Typography>
                    <material_1.Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Critical Issues
                    </material_1.Typography>
                  </material_1.Box>
                  <Error_1.default sx={{ fontSize: 40, opacity: 0.7 }}/>
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.Card sx={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
            transform: "translateY(0)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }
        }}>
              <material_1.CardContent>
                <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
                  <material_1.Box>
                    <material_1.Typography variant="h4" fontWeight="bold">
                      {logs.filter(l => l.cached).length}
                    </material_1.Typography>
                    <material_1.Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Cached Results
                    </material_1.Typography>
                  </material_1.Box>
                  <Speed_1.default sx={{ fontSize: 40, opacity: 0.7 }}/>
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
          <material_1.Grid item xs={12} sm={6} md={3}>
            <material_1.Card sx={{
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            color: "white",
            transform: "translateY(0)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }
        }}>
              <material_1.CardContent>
                <material_1.Box display="flex" alignItems="center" justifyContent="space-between">
                  <material_1.Box>
                    <material_1.Typography variant="h4" fontWeight="bold">
                      {logs.filter(l => l.status === "completed").length}
                    </material_1.Typography>
                    <material_1.Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Completed
                    </material_1.Typography>
                  </material_1.Box>
                  <CheckCircle_1.default sx={{ fontSize: 40, opacity: 0.7 }}/>
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        </material_1.Grid>

        <material_1.Grid container spacing={3} justifyContent="center">
          {/* Left column: Upload + preview */}
          <material_1.Grid item xs={12} lg={5}>
            <material_1.Fade in timeout={800}>
              <material_1.Card sx={{
            height: "100%",
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            borderRadius: 3,
            overflow: "hidden",
        }}>
                <material_1.CardContent sx={{ p: 3 }}>
                  <material_1.Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <material_1.Avatar sx={{ bgcolor: "#667eea", mr: 2 }}>
                      <CloudUpload_1.default />
                    </material_1.Avatar>
                    <material_1.Typography variant="h5" fontWeight={600}>
                      Upload Log File
                    </material_1.Typography>
                  </material_1.Box>

                  <material_1.Box sx={{
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
        }}>
                    <input type="file" accept=".log,.txt,.json,text/plain,application/json" onChange={handleFileChange} style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.0001,
            cursor: "pointer",
            zIndex: 1,
        }}/>
                    <material_1.Zoom in timeout={600}>
                      <material_1.Avatar sx={{
            bgcolor: "#667eea",
            mx: "auto",
            mb: 2,
            width: 64,
            height: 64,
            position: "relative",
            zIndex: 0,
        }}>
                        <CloudUpload_1.default sx={{ fontSize: 32 }}/>
                      </material_1.Avatar>
                    </material_1.Zoom>
                    <material_1.Typography variant="h6" gutterBottom color="primary" sx={{ position: "relative", zIndex: 0 }}>
                      Drop your log file here
                    </material_1.Typography>
                    <material_1.Typography variant="body2" color="text.secondary" sx={{ mb: 2, position: "relative", zIndex: 0 }}>
                      Supports .log, .txt, .json files (max 5MB)
                    </material_1.Typography>
                    <material_1.Button variant="contained" sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            position: "relative",
            zIndex: 0,
            pointerEvents: "none",
        }}>
                      Browse Files
                    </material_1.Button>
                    {selectedFile && (<material_1.Fade in timeout={300}>
                        <material_1.Box mt={2} sx={{ position: "relative", zIndex: 0 }}>
                          <material_1.Alert severity="success" sx={{ borderRadius: 2 }}>
                            <material_1.Typography variant="body2">
                              <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </material_1.Typography>
                          </material_1.Alert>
                        </material_1.Box>
                      </material_1.Fade>)}
                  </material_1.Box>

                  <material_1.Box mt={3} display="flex" justifyContent="center">
                    <material_1.Fab variant="extended" color="primary" onClick={handleUpload} disabled={uploading || !selectedFile} sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            px: 4,
            "&:disabled": {
                background: "#e0e0e0",
            }
        }}>
                      {uploading ? (<>
                          <material_1.CircularProgress size={20} sx={{ mr: 1 }} color="inherit"/>
                          Analyzing...
                        </>) : (<>
                          <Psychology_1.default sx={{ mr: 1 }}/>
                          Analyze with AI
                        </>)}
                    </material_1.Fab>
                  </material_1.Box>

                  {filePreview && (<material_1.Box mt={3}>
                      <material_1.Typography variant="h6" gutterBottom fontWeight={600}>
                        Log Preview
                      </material_1.Typography>
                      <material_1.Paper sx={{
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
            }}>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                          {filePreview}
                        </pre>
                      </material_1.Paper>
                    </material_1.Box>)}
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Fade>
          </material_1.Grid>

          {/* Right column: History + analysis */}
          <material_1.Grid item xs={12} lg={7}>
            <material_1.Fade in timeout={1000}>
              <material_1.Box>
                <material_1.Typography variant="h5" fontWeight={600} mb={2} textAlign="center">
                  Analysis Dashboard
                </material_1.Typography>
                <material_1.Grid container spacing={2} justifyContent="center">
                  {/* Upload history list */}
                  <material_1.Grid item xs={12} md={5}>
                    <material_1.Card sx={{
            height: 500,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            borderRadius: 3,
        }}>
                      <material_1.CardContent sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                        <material_1.Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <material_1.Box display="flex" alignItems="center" gap={1}>
                            <material_1.Avatar sx={{ bgcolor: "#667eea", width: 32, height: 32 }}>
                              <History_1.default fontSize="small"/>
                            </material_1.Avatar>
                            <material_1.Typography variant="h6" fontWeight={600}>
                              Upload History
                            </material_1.Typography>
                          </material_1.Box>
                          {loadingLogs && <material_1.CircularProgress size={20}/>}
                        </material_1.Box>
                        <material_1.Divider sx={{ mb: 2 }}/>
                        <material_1.Box sx={{ flexGrow: 1, overflow: "auto" }}>
                          {logs.length === 0 ? (<material_1.Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                              <History_1.default sx={{ fontSize: 48, mb: 2, opacity: 0.3 }}/>
                              <material_1.Typography variant="body2">
                                No uploads yet
                              </material_1.Typography>
                            </material_1.Box>) : (<material_1.List disablePadding>
                              {logs.map((log, index) => (<material_1.Slide in timeout={300 + index * 50} direction="right" key={log.id}>
                                  <material_1.Card sx={{
                    mb: 1,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        transform: "translateX(5px)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }
                }} onClick={() => handleSelectLog(log)}>
                                    <material_1.CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                      <material_1.Box display="flex" alignItems="center" mb={1}>
                                        <material_1.Typography variant="body2" fontWeight={500} sx={{ flexGrow: 1, mr: 1 }}>
                                          {log.filename}
                                        </material_1.Typography>
                                        {severityChip(log.severity)}
                                      </material_1.Box>
                                      <material_1.Box display="flex" alignItems="center" gap={1}>
                                        {log.cached && (<material_1.Chip label="CACHED" size="small" sx={{
                        bgcolor: "#e8f5e8",
                        color: "#2e7d32",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                    }}/>)}
                                        <material_1.Typography variant="caption" color="text.secondary">
                                          {new Date(log.uploadedAt).toLocaleDateString()}
                                        </material_1.Typography>
                                      </material_1.Box>
                                    </material_1.CardContent>
                                  </material_1.Card>
                                </material_1.Slide>))}
                            </material_1.List>)}
                        </material_1.Box>
                      </material_1.CardContent>
                    </material_1.Card>
                  </material_1.Grid>

                  {/* Analysis details */}
                  <material_1.Grid item xs={12} md={7}>
                    <material_1.Card sx={{
            height: 500,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            borderRadius: 3,
        }}>
                      <material_1.CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                        <material_1.Box display="flex" alignItems="center" gap={2} mb={2}>
                          <material_1.Avatar sx={{ bgcolor: "#667eea" }}>
                            <Psychology_1.default />
                          </material_1.Avatar>
                          <material_1.Typography variant="h6" fontWeight={600}>
                            AI Analysis
                          </material_1.Typography>
                        </material_1.Box>
                        <material_1.Divider sx={{ mb: 2 }}/>
                        
                        <material_1.Box sx={{ flexGrow: 1, overflow: "auto" }}>
                          {loadingDetail && (<material_1.Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
                              <material_1.CircularProgress size={40}/>
                              <material_1.Typography variant="body2" color="text.secondary">
                                Analyzing with AI...
                              </material_1.Typography>
                              <material_1.LinearProgress sx={{ width: "60%" }}/>
                            </material_1.Box>)}
                          
                          {!loadingDetail && !detail && (<material_1.Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                              <Psychology_1.default sx={{ fontSize: 48, mb: 2, opacity: 0.3 }}/>
                              <material_1.Typography variant="body2" textAlign="center">
                                Select a log from history or upload a new file to see AI analysis
                              </material_1.Typography>
                            </material_1.Box>)}
                          
                          {!loadingDetail && detail && (<material_1.Fade in timeout={500}>
                              <material_1.Box>
                                <material_1.Box display="flex" alignItems="center" gap={1} mb={2}>
                                  <material_1.Typography variant="h6" fontWeight={600}>
                                    {detail.log.filename}
                                  </material_1.Typography>
                                  {severityChip(detail.analysis?.severity)}
                                </material_1.Box>
                                
                                <material_1.Typography variant="caption" color="text.secondary" mb={3} display="block">
                                  Uploaded: {new Date(detail.log.uploadedAt).toLocaleString()}
                                  {detail.analysisCreatedAt &&
                ` • Analyzed: ${new Date(detail.analysisCreatedAt).toLocaleString()}`}
                                </material_1.Typography>

                                {detail.analysis ? (<>
                                    <material_1.Card sx={{ mb: 2, bgcolor: "#f8f9ff", borderRadius: 2 }}>
                                      <material_1.CardContent sx={{ p: 2 }}>
                                        <material_1.Typography variant="subtitle2" fontWeight={600} color="primary" gutterBottom>
                                          Issue Type
                                        </material_1.Typography>
                                        <material_1.Typography variant="body2">
                                          {detail.analysis.issueType}
                                        </material_1.Typography>
                                      </material_1.CardContent>
                                    </material_1.Card>

                                    <material_1.Card sx={{ mb: 2, bgcolor: "#fff8f8", borderRadius: 2 }}>
                                      <material_1.CardContent sx={{ p: 2 }}>
                                        <material_1.Typography variant="subtitle2" fontWeight={600} color="error" gutterBottom>
                                          Root Cause
                                        </material_1.Typography>
                                        <material_1.Typography variant="body2">
                                          {detail.analysis.rootCause}
                                        </material_1.Typography>
                                      </material_1.CardContent>
                                    </material_1.Card>

                                    <material_1.Card sx={{ mb: 2, bgcolor: "#f8fff8", borderRadius: 2 }}>
                                      <material_1.CardContent sx={{ p: 2 }}>
                                        <material_1.Typography variant="subtitle2" fontWeight={600} color="success" gutterBottom>
                                          Suggested Fix
                                        </material_1.Typography>
                                        <material_1.Typography variant="body2">
                                          {detail.analysis.suggestedFix}
                                        </material_1.Typography>
                                      </material_1.CardContent>
                                    </material_1.Card>

                                    {detail.analysis.insights && detail.analysis.insights.length > 0 && (<material_1.Card sx={{ bgcolor: "#f0f8ff", borderRadius: 2 }}>
                                        <material_1.CardContent sx={{ p: 2 }}>
                                          <material_1.Typography variant="subtitle2" fontWeight={600} color="info" gutterBottom>
                                            Additional Insights
                                          </material_1.Typography>
                                          <material_1.List dense>
                                            {detail.analysis.insights.map((ins, idx) => (<material_1.ListItem key={idx} sx={{ py: 0.5 }}>
                                                <material_1.ListItemText primary={<material_1.Typography variant="body2">
                                                      • {ins}
                                                    </material_1.Typography>}/>
                                              </material_1.ListItem>))}
                                          </material_1.List>
                                        </material_1.CardContent>
                                      </material_1.Card>)}
                                  </>) : (<material_1.Alert severity="info" sx={{ borderRadius: 2 }}>
                                    No AI analysis available for this log yet.
                                  </material_1.Alert>)}
                              </material_1.Box>
                            </material_1.Fade>)}
                        </material_1.Box>
                      </material_1.CardContent>
                    </material_1.Card>
                  </material_1.Grid>
                </material_1.Grid>
              </material_1.Box>
            </material_1.Fade>
          </material_1.Grid>
        </material_1.Grid>
      </material_1.Container>

      <material_1.Snackbar open={!!snackbar} autoHideDuration={4000} onClose={() => setSnackbar(null)} TransitionComponent={material_1.Slide} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <material_1.Alert onClose={() => setSnackbar(null)} severity="success" sx={{ borderRadius: 2 }}>
          {snackbar}
        </material_1.Alert>
      </material_1.Snackbar>
    </>);
}
exports.default = App;
//# sourceMappingURL=App.js.map