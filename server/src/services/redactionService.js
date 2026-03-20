"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactSensitiveData = void 0;
const rules = {
    ip: {
        regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)(?:\.(?!$)|$)){4}\b/g,
        token: "[REDACTED_IP]",
    },
    ipv6: {
        regex: /\b(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4}\b/gi,
        token: "[REDACTED_IPV6]",
    },
    path: {
        regex: /([A-Za-z]:)?(\/|\\)([^\s]+)/g,
        token: "[REDACTED_PATH]",
    },
    username: {
        regex: /user(name)?=\w+/gi,
        token: "[REDACTED_USERNAME]",
    },
    apiKey: {
        regex: /(?:(api|secret|token)[-_]?(key)?)[=\s:]+[A-Za-z0-9_\-]{16,}/gi,
        token: "[REDACTED_KEY]",
    },
    url: {
        regex: /\bhttps?:\/\/[^\s]+/gi,
        token: "[REDACTED_URL]",
    },
    timestamp: {
        regex: /\b\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b/g,
        token: "[REDACTED_TIMESTAMP]",
    },
};
const redactSensitiveData = (log) => {
    let sanitized = log;
    const redactions = {};
    Object.entries(rules).forEach(([key, value]) => {
        let count = 0;
        sanitized = sanitized.replace(value.regex, () => {
            count += 1;
            return value.token;
        });
        if (count > 0) {
            redactions[key] = count;
        }
    });
    return { sanitized, redactions };
};
exports.redactSensitiveData = redactSensitiveData;
//# sourceMappingURL=redactionService.js.map