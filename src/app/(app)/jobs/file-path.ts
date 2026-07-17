export function sanitizePathSegment(value: string) {
  return (
    value
      .trim()
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/[/\\?%*:|"<>]/g, "-")
      .trim()
      .slice(0, 100) || "unknown"
  );
}

export function buildJobFilePath(
  customerName: string,
  campaignName: string | null,
  jobNumber: string,
  fileName: string
) {
  const segments = [sanitizePathSegment(customerName)];
  if (campaignName) segments.push(sanitizePathSegment(campaignName));
  segments.push(sanitizePathSegment(jobNumber));

  const extMatch = fileName.match(/\.[^.]+$/);
  const ext = extMatch ? extMatch[0].replace(/[^\x00-\x7F]/g, "") : "";
  const baseName = ext ? fileName.slice(0, -extMatch![0].length) : fileName;
  const safeFileName = `${jobNumber}_${sanitizePathSegment(baseName)}${ext}`;

  return `${segments.join("/")}/${safeFileName}`;
}
