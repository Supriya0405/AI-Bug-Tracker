"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidFile = exports.MAX_FILE_SIZE = void 0;
const allowedMime = new Set([
    "text/plain",
    "application/json",
    "application/log",
]);
const allowedExt = new Set([".log", ".txt", ".json"]);
exports.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const isValidFile = (filename, mimetype, size) => {
    const lower = filename.toLowerCase();
    const dotIndex = lower.lastIndexOf(".");
    const extValue = dotIndex >= 0 ? lower.slice(dotIndex) : "";
    const extOk = allowedExt.has(extValue);
    const mimeOk = allowedMime.has(mimetype);
    const sizeOk = size <= exports.MAX_FILE_SIZE;
    // Accept if size is OK and either extension OR mimetype look valid
    return sizeOk && (extOk || mimeOk);
};
exports.isValidFile = isValidFile;
//# sourceMappingURL=fileValidation.js.map