"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const lru_cache_1 = require("lru-cache");
const env_1 = require("../config/env");
const cache = new lru_cache_1.LRUCache({
    max: 100,
    ttl: env_1.env.cacheTtlMs,
});
exports.cacheService = {
    get(hash) {
        return cache.get(hash);
    },
    set(hash, value) {
        cache.set(hash, value);
    },
};
//# sourceMappingURL=cacheService.js.map