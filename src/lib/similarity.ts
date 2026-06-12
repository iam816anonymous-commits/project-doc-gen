import crypto from 'crypto';

interface ProjectData {
  title: string;
  techStack: string;
  features: string;
  [key: string]: string | number | boolean | null | undefined;
}

export function createFingerprint(data: Record<string, string | number | boolean | null | undefined>): string {
  const normalized = JSON.stringify(data, Object.keys(data).sort()).toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function calculateSimilarity(a: ProjectData, b: ProjectData): number {
  let score = 0;
  const total = 3;

  // Title similarity (basic)
  if (a.title.toLowerCase() === b.title.toLowerCase()) score += 1;
  else if (a.title.toLowerCase().includes(b.title.toLowerCase()) || b.title.toLowerCase().includes(a.title.toLowerCase())) score += 0.5;

  // Tech stack overlap
  const stackA = new Set(a.techStack.toLowerCase().split(',').map((s: string) => s.trim()));
  const stackB = new Set(b.techStack.toLowerCase().split(',').map((s: string) => s.trim()));
  const intersection = new Set([...stackA].filter(x => stackB.has(x)));
  score += intersection.size / Math.max(stackA.size, stackB.size);

  // Features overlap
  const featA = new Set(a.features.toLowerCase().split(',').map((s: string) => s.trim()));
  const featB = new Set(b.features.toLowerCase().split(',').map((s: string) => s.trim()));
  const featIntersection = new Set([...featA].filter(x => featB.has(x)));
  score += featIntersection.size / Math.max(featA.size, featB.size);

  return (score / total) * 100;
}
