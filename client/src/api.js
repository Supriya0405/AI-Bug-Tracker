"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLogs = fetchLogs;
exports.fetchLogDetail = fetchLogDetail;
exports.uploadLogFile = uploadLogFile;
const axios_1 = __importDefault(require("axios"));
const api = axios_1.default.create({
    baseURL: "http://localhost:5000/api", // backend base URL
});
async function fetchLogs() {
    const res = await api.get("/logs");
    return res.data.data;
}
async function fetchLogDetail(id) {
    const res = await api.get(`/logs/${id}`);
    return res.data;
}
async function uploadLogFile(file) {
    const formData = new FormData();
    formData.append("logFile", file);
    const res = await api.post("/logs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}
//# sourceMappingURL=api.js.map