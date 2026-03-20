import { LRUCache } from "lru-cache";
import type { AnalysisResult } from "../types";
import { env } from "../config/env";

const cache = new LRUCache<string, AnalysisResult>({
  max: 100,
  ttl: env.cacheTtlMs,
});

export const cacheService = {
  get(hash: string) {
    return cache.get(hash);
  },
  set(hash: string, value: AnalysisResult) {
    cache.set(hash, value);
  },
};

