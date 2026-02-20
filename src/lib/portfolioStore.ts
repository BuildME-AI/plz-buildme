export type PortfolioVersion = {
  id: string;
  title: string;
  targetRole: string;
  matchScore: number;
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  optimizedParagraph?: string;
  feedback?: string[];
  keywords?: string[];
  activityId?: string;
  createdAt: string;
};

const KEY = "buildme.portfolioVersions";

export function getPortfolioVersions(): PortfolioVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PortfolioVersion[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.targetRole === "string" &&
        typeof item.matchScore === "number" &&
        typeof item.createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function addPortfolioVersion(version: PortfolioVersion) {
  if (typeof window === "undefined") return;
  const current = getPortfolioVersions();
  const next = [version, ...current.filter((item) => item.id !== version.id)].slice(0, 100);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function removePortfolioVersion(versionId: string) {
  if (typeof window === "undefined") return;
  const current = getPortfolioVersions();
  const next = current.filter((item) => item.id !== versionId);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function removePortfolioVersionByActivityId(activityId: string) {
  if (typeof window === "undefined") return;
  const current = getPortfolioVersions();
  const next = current.filter((item) => item.activityId !== activityId);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
