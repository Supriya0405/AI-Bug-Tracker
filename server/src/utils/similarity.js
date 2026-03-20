"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSimilarLog = void 0;
const string_similarity_1 = __importDefault(require("string-similarity"));
const isSimilarLog = (a, b, threshold = 0.85) => {
    if (!a || !b)
        return false;
    // Reduce whitespace noise
    const clean = (text) => text.replace(/\s+/g, " ").trim().slice(0, 4000);
    const score = string_similarity_1.default.compareTwoStrings(clean(a), clean(b));
    return score >= threshold;
};
exports.isSimilarLog = isSimilarLog;
//# sourceMappingURL=similarity.js.map