import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { Sparkles, ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { addActivity, recordJobVersion } from "../../lib/dashboardState";
import { addPortfolioVersion } from "../../lib/portfolioStore";
import { parseStarSections } from "../../lib/star";

type JobOption = {
  id: string;
  label: string;
  isCustom?: boolean;
};

const DEFAULT_JOB_OPTIONS: JobOption[] = [
  { id: "marketing", label: "콘텐츠 마케팅" },
  { id: "pm", label: "프로덕트 매니저" },
  { id: "operations", label: "운영 관리" },
  { id: "cs", label: "고객 성공 매니저" },
];

const CUSTOM_JOB_KEY = "buildme.customJobs";
const MATCH_CACHE_KEY = "buildme.jobMatchCache";
type MatchCache = {
  interviewFingerprint: string;
  scores: Record<string, number>;
};
type InterviewSignal = {
  summary?: string;
  specificityScore?: number;
  impactScore?: number;
};

function safeParseInterviewRaw(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("buildme.interviewResult") || "";
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getInterviewFingerprint(structuredId: string | null): string {
  const interviewRaw = safeParseInterviewRaw();
  if (interviewRaw) return `iv-${hashString(interviewRaw)}`;
  return `structured-${structuredId ?? "none"}`;
}

function loadMatchCache(): MatchCache | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(MATCH_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MatchCache;
    if (!parsed || typeof parsed.interviewFingerprint !== "string" || typeof parsed.scores !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveMatchCache(cache: MatchCache) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MATCH_CACHE_KEY, JSON.stringify(cache));
}

function makeCustomJobId(label: string) {
  return `custom-${hashString(label.trim().toLowerCase())}`;
}

function loadCustomJobs(): JobOption[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CUSTOM_JOB_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{ id: string; label: string }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => typeof x?.id === "string" && typeof x?.label === "string")
      .map((x) => ({ id: x.id, label: x.label, isCustom: true }));
  } catch {
    return [];
  }
}

function saveCustomJobs(jobs: JobOption[]) {
  if (typeof window === "undefined") return;
  const payload = jobs.map((j) => ({ id: j.id, label: j.label }));
  window.localStorage.setItem(CUSTOM_JOB_KEY, JSON.stringify(payload));
}

function deterministicLocalMatchScore(interviewFingerprint: string, jobId: string): number {
  const seed = hashString(`${interviewFingerprint}:${jobId}`);
  // 70~95 범위 고정 점수
  return 70 + (seed % 26);
}

const getMatchFeedbackText = (score: number | null | undefined, jobLabel?: string) => {
  if (!jobLabel) return "직무를 선택하면 경험을 맞춤 최적화합니다.";
  if (score === null || score === undefined) return `${jobLabel} 직무에 대한 매칭도를 분석합니다.`;
  if (score >= 80) return `${jobLabel} 직무에 매우 적합한 경험입니다.`;
  if (score >= 60) return `${jobLabel} 직무에 적합한 경험입니다.`;
  if (score >= 40) return `일부 연관성이 있으며, ${jobLabel} 직무에 맞춰 더 개선할 수 있습니다.`;
  return `${jobLabel} 직무와 연관성이 낮습니다. 경험을 더 구체화하거나 다른 경험을 선택해 보세요.`;
};

const JOB_KEYWORDS: Record<string, string[]> = {
  marketing: ["콘텐츠", "캠페인", "전환", "도달", "브랜딩", "성과"],
  pm: ["우선순위", "요구사항", "지표", "실험", "로드맵", "협업"],
  operations: ["프로세스", "표준화", "운영", "효율", "절감", "개선"],
  cs: ["고객", "만족", "문의", "응대", "재방문", "문제해결"],
};

const getMatchReasonText = (params: {
  score: number | null | undefined;
  selectedJobId?: string | null;
  jobLabel?: string;
  summary?: string;
  specificityScore?: number;
  impactScore?: number;
}) => {
  const { score, selectedJobId, jobLabel, summary, specificityScore, impactScore } = params;
  if (score === null || score === undefined) {
    return "인터뷰 기반 신호를 수집 중입니다.";
  }
  const roleName = jobLabel || "선택한 직무";
  const normalizedSummary = (summary || "").toLowerCase();
  const keywords = selectedJobId ? JOB_KEYWORDS[selectedJobId] || [] : [];
  const matched = keywords.filter((k) => normalizedSummary.includes(k.toLowerCase()));
  const hasMetric =
    /(\d+%|\d+\s*(명|건|원|만원|억원|배|일|주|월)|증가|감소|향상|개선|절감|달성)/.test(summary || "");

  if (score < 60) {
    if ((specificityScore ?? 0) < 70) {
      return `${roleName} 기준에서 답변 구체성이 낮아 점수가 낮게 반영되었습니다.`;
    }
    if ((impactScore ?? 0) < 70) {
      return `${roleName} 기준에서 수치/성과 근거가 부족해 점수가 낮게 반영되었습니다.`;
    }
    if (matched.length === 0) {
      return `${roleName} 핵심 키워드와 인터뷰 경험 연결성이 약해 점수가 낮게 반영되었습니다.`;
    }
    return `${roleName} 키워드 일부는 맞지만 핵심 근거(구체성/성과)가 부족해 점수가 낮게 반영되었습니다.`;
  }
  if (score < 80) {
    if (!hasMetric) {
      return `${roleName}와 연관성은 있으나 인터뷰에서 정량 성과 근거가 약해 중간 점수로 반영되었습니다.`;
    }
    if (matched.length <= 1) {
      return `${roleName}와 기본 연관성은 있으나 직무 키워드 반영이 제한적이라 점수가 보수적으로 반영되었습니다.`;
    }
    return `${roleName}와 기본 연관성은 있으나, 직무 키워드와 정량 성과를 더 보강하면 점수가 올라갑니다.`;
  }
  return `${roleName} 핵심 키워드 ${matched.length > 0 ? `${matched.slice(0, 2).join(", ")} ` : ""}및 인터뷰 성과 근거가 함께 확인되어 높게 평가되었습니다.`;
};

const HighlightedText = ({ text, keyword }: { text: string; keyword: string | null }) => {
  if (!keyword || !text) {
    return <>{text}</>;
  }

  // Split text into sentences, keeping delimiters.
  const sentences = text.match(/[^.!?]+[.!?\s]*/g) || [text];

  return (
    <>
      {sentences.map((sentence, index) => {
        if (sentence.includes(keyword)) {
          return (
            <mark key={index} className="bg-[#FEF3C7] text-[#92400E] px-0.5 rounded-sm">
              {sentence}
            </mark>
          );
        }
        return <span key={index}>{sentence}</span>;
      })}
    </>
  );
};

export function JobMatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobOptions, setJobOptions] = useState<JobOption[]>(() => [
    ...DEFAULT_JOB_OPTIONS,
    ...loadCustomJobs(),
  ]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customJobInput, setCustomJobInput] = useState("");
  const [company, setCompany] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobScores, setJobScores] = useState<Record<string, number>>({});
  const [highlightedKeyword, setHighlightedKeyword] = useState<string | null>(null);
  const [interviewSignal, setInterviewSignal] = useState<InterviewSignal>({});

  const selectedJobData = jobOptions.find((job) => job.id === selectedJob);
  const structuredId =
    (location.state as any)?.structuredId ?? localStorage.getItem("buildme.structuredId");
  const hasInterviewResult = !!localStorage.getItem("buildme.interviewResult");
  const interviewFingerprint = getInterviewFingerprint(structuredId);

  useEffect(() => {
    const raw = localStorage.getItem("buildme.interviewResult");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as InterviewSignal;
      setInterviewSignal({
        summary: typeof parsed.summary === "string" ? parsed.summary : undefined,
        specificityScore:
          typeof parsed.specificityScore === "number" ? parsed.specificityScore : undefined,
        impactScore: typeof parsed.impactScore === "number" ? parsed.impactScore : undefined,
      });
    } catch {
      setInterviewSignal({});
    }
  }, [interviewFingerprint]);

  const addCustomJob = () => {
    const label = customJobInput.trim();
    if (!label) return;
    const id = makeCustomJobId(label);
    const exists = jobOptions.some((j) => j.id === id || j.label === label);
    if (exists) {
      setCustomJobInput("");
      return;
    }
    const next: JobOption[] = [...jobOptions, { id, label, isCustom: true }];
    setJobOptions(next);
    saveCustomJobs(next.filter((j) => j.isCustom));
    setSelectedJob(id);
    setHasAnalyzed(false);
    setResult(null);
    setCustomJobInput("");
  };

  const runMatch = async () => {
    if (!selectedJob) return;
    const job = jobOptions.find((j) => j.id === selectedJob);
    if (!job || !hasInterviewResult) return;
    setLoading(true);

    const cached = loadMatchCache();
    const sameInterviewCache = cached?.interviewFingerprint === interviewFingerprint ? cached.scores : {};
    const cachedScore = sameInterviewCache?.[job.id];

    try {
      // 같은 인터뷰 결과에서는 기존 매칭도 고정 재사용
      if (typeof cachedScore === "number") {
        setJobScores((prev) => ({ ...prev, [job.id]: cachedScore }));
        setResult({
          match_score: cachedScore,
          optimized_paragraph: `[${job.label}] 직무에 맞춰 귀하의 경험을 분석했습니다. 문제 해결 과정에서 보여주신 주도적인 태도와 성과 중심 설명이 ${company || "해당 직무"} 역량과 부합합니다.`,
          keywords: ["문제해결", "데이터기반", "협업", "주도성", "성과지향"],
          feedback: ["직무 적합도가 안정적으로 유지됩니다.", "인터뷰 내용이 업데이트되면 매칭도가 갱신됩니다."],
        });
        setHasAnalyzed(true);
        return;
      }

      // structuredId가 없거나 로컬 모드일 때도 인터뷰 기반 결정 점수 제공
      if (!structuredId || structuredId.startsWith("local-")) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const createdAt = new Date().toISOString();
        const activityId = `job-local-${Date.now()}`;
        const fixedScore = deterministicLocalMatchScore(interviewFingerprint, job.id);
        const mockResult = {
          match_score: fixedScore,
          optimized_paragraph: `[${job.label}] 직무에 맞춰 귀하의 경험을 분석했습니다. 문제 해결 과정에서 보여주신 주도적인 태도와 구체적인 성과 수치는 ${company || "이 직무"}에서 요구하는 핵심 역량과 잘 부합합니다. 특히 협업 과정에서의 소통 능력이 돋보입니다.`,
          keywords: ["문제해결", "데이터기반", "협업", "주도성", "성과지향"],
          feedback: ["직무 적합도가 높습니다.", "수치적 성과가 명확합니다."],
        };
        const star = parseStarSections(mockResult.optimized_paragraph || interviewSignal.summary || "");
        setResult(mockResult);
        setJobScores((prev) => {
          const next = { ...prev, [job.id]: fixedScore };
          saveMatchCache({ interviewFingerprint, scores: next });
          return next;
        });
        recordJobVersion(fixedScore);
        addPortfolioVersion({
          id: `portfolio-local-${Date.now()}`,
          title: `${job.label} 맞춤 포트폴리오`,
          targetRole: job.label,
          matchScore: fixedScore,
          situation: star.situation,
          task: star.task,
          action: star.action,
          result: star.result,
          optimizedParagraph: mockResult.optimized_paragraph,
          keywords: mockResult.keywords,
          feedback: mockResult.feedback,
          activityId,
          createdAt,
        });
        addActivity({
          id: activityId,
          type: "job_match",
          title: `${job.label} 직무 맞춤 분석`,
          createdAt,
        });
        setHasAnalyzed(true);
        return;
      }

      // 서버 모드: 최초 1회만 계산 후 인터뷰가 바뀌기 전까지 재사용
      const res = await apiFetch<{ jobVersion: any }>("/job-match", {
        method: "POST",
        body: JSON.stringify({
          structuredId,
          targetRole: job.label,
          targetCompany: company.trim() ? company.trim() : undefined,
        }),
      });
      setResult(res.jobVersion);
      if (typeof res.jobVersion.match_score === "number") {
        const createdAt = new Date().toISOString();
        const activityId = `job-${res.jobVersion.id ?? Date.now()}`;
        const star = parseStarSections(res.jobVersion.optimized_paragraph || interviewSignal.summary || "");
        setJobScores((prev) => {
          const next = { ...prev, [job.id]: res.jobVersion.match_score };
          saveMatchCache({ interviewFingerprint, scores: next });
          return next;
        });
        recordJobVersion(res.jobVersion.match_score);
        addPortfolioVersion({
          id: `portfolio-${res.jobVersion.id ?? Date.now()}`,
          title: `${job.label} 맞춤 포트폴리오`,
          targetRole: job.label,
          matchScore: res.jobVersion.match_score,
          situation: star.situation,
          task: star.task,
          action: star.action,
          result: star.result,
          optimizedParagraph: res.jobVersion.optimized_paragraph,
          keywords: Array.isArray(res.jobVersion.keywords) ? res.jobVersion.keywords : undefined,
          feedback: Array.isArray(res.jobVersion.feedback) ? res.jobVersion.feedback : undefined,
          activityId,
          createdAt,
        });
        addActivity({
          id: activityId,
          type: "job_match",
          title: `${job.label} 직무 맞춤 분석`,
          createdAt,
        });
      }
      setHasAnalyzed(true);
    } finally {
      setLoading(false);
    }
  };

  const currentScore = hasAnalyzed
    ? result?.match_score ?? (selectedJob ? jobScores[selectedJob] : null)
    : null;
  const matchReason = getMatchReasonText({
    score: currentScore,
    selectedJobId: selectedJob,
    jobLabel: selectedJobData?.label,
    summary: interviewSignal.summary,
    specificityScore: interviewSignal.specificityScore,
    impactScore: interviewSignal.impactScore,
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
            <div>
              <h1 className="text-[24px] font-semibold text-[#1A1A1A]">직무 맞춤 분석</h1>
              <p className="text-[14px] text-[#6B7280]">AI 인터뷰 완료 후 직무별 매칭도를 분석합니다</p>
            </div>
          </div>
        </div>

        {/* Job Selection */}
        <div className="mb-6">
          <div className="mb-2">
            <label className="block text-[14px] font-medium text-[#1A1A1A]">직무 선택</label>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white border border-[#D1D5DB] hover:border-[#0052FF] rounded-lg px-4 py-3 flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            >
              <span className={`text-[15px] ${selectedJob ? "text-[#1A1A1A]" : "text-[#9CA3AF]"}`}>
                {selectedJobData?.label || "직무를 선택하세요"}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#6B7280] transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden z-20">
                {jobOptions.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job.id);
                      setHasAnalyzed(false);
                      setResult(null);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#F9FAFB] transition-colors flex items-center justify-between"
                  >
                    <span className="text-[14px] text-[#1A1A1A]">{job.label}</span>
                    <span className="text-[13px] text-[#6B7280]">
                      매칭도 {jobScores[job.id] != null ? `${jobScores[job.id]}%` : "—"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={customJobInput}
              onChange={(e) => setCustomJobInput(e.target.value)}
              placeholder="직무 직접 추가 (예: 데이터 분석가)"
              className="flex-1 bg-white border border-[#D1D5DB] rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
            <button
              type="button"
              onClick={addCustomJob}
              disabled={!customJobInput.trim()}
              className="px-4 py-2.5 rounded-lg text-[14px] font-medium bg-[#EEF2FF] text-[#1E40AF] disabled:opacity-50"
            >
              직무 추가
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">기업명 (선택)</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="예) 네이버, 카카오, 당근"
            className="w-full bg-white border border-[#D1D5DB] rounded-lg px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent"
          />
          <p className="text-[12px] text-[#6B7280] mt-2">기업명을 입력하면 요구 역량 키워드가 더 정밀해집니다.</p>
        </div>

        {hasInterviewResult && selectedJob && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={runMatch}
              disabled={loading}
              className="bg-[#0052FF] hover:bg-[#0047E0] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-medium text-[14px]"
            >
              {loading ? "AI 매칭 분석 중..." : "AI 매칭 분석 실행"}
            </button>
          </div>
        )}

        {/* Analysis Result */}
        {hasInterviewResult && selectedJob && hasAnalyzed ? (
          <div className="space-y-4">
            {/* Matching Score */}
            <div className="bg-[#0052FF] rounded-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-[18px] font-semibold">매칭 분석 결과</h2>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[48px] font-bold">
                  {loading ? "..." : `${currentScore ?? 0}%`}
                </span>
                <span className="text-[16px] opacity-80">매칭도</span>
              </div>
              <p className="text-[14px] opacity-90">
                {loading ? "분석 중..." : getMatchFeedbackText(currentScore, selectedJobData?.label)}
              </p>
              <p className="text-[12px] opacity-85 mt-2">
                근거: {loading ? "근거 분석 중..." : matchReason}
              </p>
            </div>

            {/* Optimized Experience */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
              <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">직무 맞춤 경험 강조</h3>
              <div className="space-y-3">
                <div className="bg-[#FAFAFA] rounded-lg p-4">
                  <p className="text-[14px] text-[#1A1A1A] font-medium mb-2">완성 문단</p>
                  <div className="text-[13px] text-[#6B7280] leading-[1.6]">
                    {loading ? (
                      "생성 중..."
                    ) : result?.optimized_paragraph ? (
                      <HighlightedText text={result.optimized_paragraph} keyword={highlightedKeyword} />
                    ) : (
                      "결과가 없습니다. 인터뷰 결과(구조화)를 먼저 생성해 주세요."
                    )}
                  </div>
                </div>
                {Array.isArray(result?.keywords) && result.keywords.length > 0 && (
                  <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                    <p className="text-[13px] text-[#6B7280] mb-2">요구 역량 키워드</p>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.slice(0, 12).map((k: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setHighlightedKeyword(highlightedKeyword === k ? null : k)}
                          className={`border text-[12px] px-3 py-1.5 rounded-lg transition-colors ${
                            highlightedKeyword === k
                              ? "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] font-medium"
                              : "bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB]"
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={() => navigate("/portfolio")}
                className="flex items-center gap-2 bg-[#0052FF] hover:bg-[#0047E0] text-white px-6 py-3 rounded-lg font-medium text-[15px] transition-colors"
              >
                최종 포트폴리오 생성
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : hasInterviewResult && selectedJob ? (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 text-center">
            <p className="text-[15px] text-[#6B7280]">직무를 선택했습니다. 버튼을 눌러 AI 매칭 분석을 실행하세요.</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-lg p-12 text-center">
            <div className="w-12 h-12 bg-[#F9FAFB] rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            <p className="text-[15px] text-[#6B7280]">
              초기에는 매칭 결과를 표시하지 않습니다
            </p>
            {!hasInterviewResult ? (
              <p className="text-[12px] text-[#9CA3AF] mt-2">
                AI 인터뷰를 먼저 완료하면 직무 맞춤 분석이 활성화됩니다.
              </p>
            ) : (
              <p className="text-[12px] text-[#9CA3AF] mt-2">직무를 선택하고 AI 매칭 분석을 실행해 주세요.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
