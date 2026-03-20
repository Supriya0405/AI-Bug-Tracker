const allowedMime = new Set([
  "text/plain",
  "application/json",
  "application/log",
]);

const allowedExt = new Set([".log", ".txt", ".json"]);

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const isValidFile = (
  filename: string,
  mimetype: string,
  size: number
) => {
  const lower = filename.toLowerCase();
  const dotIndex = lower.lastIndexOf(".");
  const extValue = dotIndex >= 0 ? lower.slice(dotIndex) : "";
  const extOk = allowedExt.has(extValue);
  const mimeOk = allowedMime.has(mimetype);
  const sizeOk = size <= MAX_FILE_SIZE;

  // Accept if size is OK and either extension OR mimetype look valid
  return sizeOk && (extOk || mimeOk);
};