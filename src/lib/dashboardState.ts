export type DashboardSummary = {
  totalAnalyses: number
  averageScore: number
  totalJobVersions: number
  lastMatchScore: number | null
}

export type ActivityItem = {
  id: string
  type: 'onboarding' | 'interview' | 'analysis' | 'job_match' | 'portfolio'
  title: string
  createdAt: string
}

type DashboardState = {
  summary: DashboardSummary
  activities: ActivityItem[]
}

const KEY = 'buildme.dashboard'

function loadState(): DashboardState {
  if (typeof window === 'undefined') {
    return {
      summary: { totalAnalyses: 0, averageScore: 0, totalJobVersions: 0, lastMatchScore: null },
      activities: [],
    }
  }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) {
      return {
        summary: { totalAnalyses: 0, averageScore: 0, totalJobVersions: 0, lastMatchScore: null },
        activities: [],
      }
    }
    const parsed = JSON.parse(raw) as DashboardState
    if (!parsed.summary || !Array.isArray(parsed.activities)) {
      throw new Error('invalid')
    }
    return parsed
  } catch {
    return {
      summary: { totalAnalyses: 0, averageScore: 0, totalJobVersions: 0, lastMatchScore: null },
      activities: [],
    }
  }
}

function saveState(state: DashboardState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(state))
}

export function getDashboardState(): DashboardState {
  return loadState()
}

export function addActivity(activity: ActivityItem) {
  const state = loadState()
  const next: DashboardState = {
    ...state,
    activities: [activity, ...state.activities].slice(0, 20),
  }
  saveState(next)
}

export function removeActivity(activityId: string) {
  const state = loadState()
  const next: DashboardState = {
    ...state,
    activities: state.activities.filter((a) => a.id !== activityId),
  }
  saveState(next)
}

export function recordAnalysis(overallScore: number) {
  const state = loadState()
  const totalAnalyses = state.summary.totalAnalyses + 1
  const totalScore = state.summary.averageScore * state.summary.totalAnalyses + overallScore
  const averageScore = totalAnalyses > 0 ? Math.round(totalScore / totalAnalyses) : 0
  const next: DashboardState = {
    ...state,
    summary: {
      ...state.summary,
      totalAnalyses,
      averageScore,
    },
  }
  saveState(next)
}

export function recordJobVersion(matchScore: number) {
  const state = loadState()
  const totalJobVersions = state.summary.totalJobVersions + 1
  const next: DashboardState = {
    ...state,
    summary: {
      ...state.summary,
      totalJobVersions,
      lastMatchScore: Math.round(matchScore),
    },
  }
  saveState(next)
}

export function decrementJobVersion(nextLastMatchScore?: number | null) {
  const state = loadState()
  const totalJobVersions = Math.max(0, state.summary.totalJobVersions - 1)
  const lastMatchScore =
    totalJobVersions === 0 ? null : nextLastMatchScore === undefined ? state.summary.lastMatchScore : nextLastMatchScore
  const next: DashboardState = {
    ...state,
    summary: {
      ...state.summary,
      totalJobVersions,
      lastMatchScore,
    },
  }
  saveState(next)
}

export function resetSummary() {
  const state = loadState()
  const next: DashboardState = {
    summary: { totalAnalyses: 0, averageScore: 0, totalJobVersions: 0, lastMatchScore: null },
    activities: state.activities,
  }
  saveState(next)
}

