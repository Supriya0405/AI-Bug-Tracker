import stringSimilarity from "string-similarity";

export const isSimilarLog = (a: string, b: string, threshold = 0.85) => {
  if (!a || !b) return false;
  // Reduce whitespace noise
  const clean = (text: string) => text.replace(/\s+/g, " ").trim().slice(0, 4000);
  const score = stringSimilarity.compareTwoStrings(clean(a), clean(b));
  return score >= threshold;
};


