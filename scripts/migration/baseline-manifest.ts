type ScreenshotRecord = {
  bytes: number;
  path: string;
  sha256: string;
};

export function buildBaselineManifest(records: ScreenshotRecord[], capturedAt: string) {
  const files = [...records].sort((left, right) => left.path.localeCompare(right.path));
  const counts = new Map<string, number>();
  for (const file of files) {
    const viewport = file.path.split("/")[0] || "unknown";
    counts.set(viewport, (counts.get(viewport) || 0) + 1);
  }
  return {
    capturedAt,
    files,
    viewports: [...counts.entries()]
      .map(([name, count]) => ({count, name}))
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}
