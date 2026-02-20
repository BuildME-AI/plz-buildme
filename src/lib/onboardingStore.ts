import { apiFetch } from "./api";

export type OnboardingPayload = {
  name: string;
  bio: string;
  targetJob: string;
  experience: string;
  achievement: string;
  purpose: string;
};

export type OnboardingDraft = {
  payload: OnboardingPayload;
  completedStep: number;
  completed: boolean;
  updatedAt: string;
};

type OnboardingApiRow = {
  payload: Partial<OnboardingPayload> | null;
  completedStep: number | null;
  completed: boolean;
  updatedAt: string | null;
};

const KEY = "buildme.onboarding.v1";
const MAX_STEP = 7;

function nowIso() {
  return new Date().toISOString();
}

function clampStep(step: number | null | undefined) {
  if (typeof step !== "number" || Number.isNaN(step)) return 0;
  return Math.max(0, Math.min(MAX_STEP, Math.round(step)));
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function emptyPayload(): OnboardingPayload {
  return {
    name: "",
    bio: "",
    targetJob: "",
    experience: "",
    achievement: "",
    purpose: "",
  };
}

function normalizeDraft(input?: Partial<OnboardingDraft> | null): OnboardingDraft {
  const payload = input?.payload ?? {};
  return {
    payload: {
      name: cleanText(payload.name),
      bio: cleanText(payload.bio),
      targetJob: cleanText(payload.targetJob),
      experience: cleanText(payload.experience),
      achievement: cleanText(payload.achievement),
      purpose: cleanText(payload.purpose),
    },
    completedStep: clampStep(input?.completedStep),
    completed: Boolean(input?.completed),
    updatedAt: cleanText(input?.updatedAt) || nowIso(),
  };
}

export function getCachedOnboardingDraft(): OnboardingDraft {
  if (typeof window === "undefined") {
    return normalizeDraft({ payload: emptyPayload() });
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return normalizeDraft({ payload: emptyPayload() });
    return normalizeDraft(JSON.parse(raw));
  } catch {
    return normalizeDraft({ payload: emptyPayload() });
  }
}

function setCachedOnboardingDraft(draft: OnboardingDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(normalizeDraft(draft)));
}

function mapApiRowToDraft(row: OnboardingApiRow): OnboardingDraft {
  return normalizeDraft({
    payload: {
      ...emptyPayload(),
      ...(row.payload ?? {}),
    },
    completedStep: row.completedStep ?? 0,
    completed: row.completed,
    updatedAt: row.updatedAt ?? nowIso(),
  });
}

export async function loadOnboardingDraft(): Promise<OnboardingDraft> {
  const cached = getCachedOnboardingDraft();
  try {
    const res = await apiFetch<{ onboarding: OnboardingApiRow | null }>("/onboarding");
    if (!res.onboarding) return cached;
    const next = mapApiRowToDraft(res.onboarding);
    setCachedOnboardingDraft(next);
    return next;
  } catch {
    return cached;
  }
}

export async function saveOnboardingDraft(params: {
  payloadPatch?: Partial<OnboardingPayload>;
  completedStep?: number;
  completed?: boolean;
}): Promise<OnboardingDraft> {
  const current = getCachedOnboardingDraft();
  const next = normalizeDraft({
    payload: {
      ...current.payload,
      ...(params.payloadPatch ?? {}),
    },
    completedStep: Math.max(current.completedStep, clampStep(params.completedStep)),
    completed: params.completed ?? current.completed,
    updatedAt: nowIso(),
  });

  setCachedOnboardingDraft(next);

  try {
    const res = await apiFetch<{ onboarding: OnboardingApiRow }>("/onboarding", {
      method: "PUT",
      body: JSON.stringify({
        payload: next.payload,
        completedStep: next.completedStep,
        completed: next.completed,
      }),
    });
    const saved = mapApiRowToDraft(res.onboarding);
    setCachedOnboardingDraft(saved);
    return saved;
  } catch {
    return next;
  }
}

export async function completeOnboarding(): Promise<OnboardingDraft> {
  const current = getCachedOnboardingDraft();
  const next = normalizeDraft({
    ...current,
    completed: true,
    completedStep: MAX_STEP,
    updatedAt: nowIso(),
  });
  setCachedOnboardingDraft(next);

  try {
    const res = await apiFetch<{ onboarding: OnboardingApiRow }>("/onboarding/complete", {
      method: "POST",
      body: JSON.stringify({
        payload: next.payload,
      }),
    });
    const saved = mapApiRowToDraft(res.onboarding);
    setCachedOnboardingDraft(saved);
    return saved;
  } catch {
    return next;
  }
}

