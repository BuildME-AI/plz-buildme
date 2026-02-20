import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { Sparkles, ChevronDown, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { addActivity, recordJobVersion } from "../../lib/dashboardState";

const jobOptions = [
  { id: "marketing", label: "콘텐츠 마케팅" },
  { id: "pm", label: "프로덕트 매니저" },
  { id: "operations", label: "운영 관리" },
  { id: "cs", label: "고객 성공 매니저" },
];

const getMatchFeedbackText = (score: number | null | undefined, jobLabel?: string) => {
  if (!jobLabel) return "직무를 선택하면 경험을 맞춤 최적화합니다.";
  if (score === null || score === undefined) return `${jobLabel} 직무에 대한 매칭도를 분석합니다.`;
  if (score >= 80) return `${jobLabel} 직무에 매우 적합한 경험입니다.`;
  if (score >= 60) return `${jobLabel} 직무에 적합한 경험입니다.`;
  if (score >= 40) return `일부 연관성이 있으며, ${jobLabel} 직무에 맞춰 더 개선할 수 있습니다.`;
  return `${jobLabel} 직무와 연관성이 낮습니다. 경험을 더 구체화하거나 다른 경험을 선택해 보세요.`;
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
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobScores, setJobScores] = useState<Record<string, number>>({});
  const [scoresLoading, setScoresLoading] = useState(false);
  const [highlightedKeyword, setHighlightedKeyword] = useState<string | null>(null);

  const selectedJobData = jobOptions.find((job) => job.id === selectedJob);
  const structuredId =
    (location.state as any)?.structuredId ?? localStorage.getItem("buildme.structuredId");

  const fetchMatchScore = async (jobId: string, targetRole: string): Promise<number | null> => {
    if (!structuredId) return null;
    
    // 로컬 모드 (백엔드 없음)
    if (structuredId.startsWith("local-")) {
      return 70 + Math.floor(Math.random() * 25); // 70~95점 랜덤 반환
    }

    try {
      const res = await apiFetch<{ jobVersion: { match_score: number } }>("/job-match", {
        method: "POST",
        body: JSON.stringify({
          structuredId,
          targetRole,
          targetCompany: company.trim() || undefined,
        }),
      });
      return typeof res.jobVersion?.match_score === "number" ? res.jobVersion.match_score : null;
    } catch {
      return null;
    }
  };

  const recalcAllScores = async () => {
    if (!structuredId) return;
    setScoresLoading(true);
    try {
      const scores = await Promise.all(
        jobOptions.map(async (job) => {
          const score = await fetchMatchScore(job.id, job.label);
          return { id: job.id, score };
        })
      );
      setJobScores((prev) => {
        const next = { ...prev };
        scores.forEach(({ id, score }) => {
          if (score != null) next[id] = score;
        });
        return next;
      });
    } finally {
      setScoresLoading(false);
    }
  };

  useEffect(() => {
    if (structuredId) recalcAllScores();
  }, [structuredId]);

  const runMatch = async (jobId: string) => {
    const job = jobOptions.find((j) => j.id === jobId);
    if (!job || !structuredId) return;
    setLoading(true);

    // 로컬 모드 (백엔드 없음)
    if (structuredId.startsWith("local-")) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockScore = 80 + Math.floor(Math.random() * 15);
      const mockResult = {
        match_score: mockScore,
        optimized_paragraph: `[${job.label}] 직무에 맞춰 귀하의 경험을 분석했습니다. 문제 해결 과정에서 보여주신 주도적인 태도와 구체적인 성과 수치는 ${company || "이 직무"}에서 요구하는 핵심 역량과 잘 부합합니다. 특히 협업 과정에서의 소통 능력이 돋보입니다.`,
        keywords: ["문제해결", "데이터기반", "협업", "주도성", "성과지향"],
        feedback: ["직무 적합도가 높습니다.", "수치적 성과가 명확합니다."]
      };
      setResult(mockResult);
      setJobScores((prev) => ({ ...prev, [jobId]: mockScore }));
      recordJobVersion(mockScore);
      addActivity({ id: `job-local-${Date.now()}`, type: "job_match", title: `${job.label} 직무 맞춤 분석`, createdAt: new Date().toISOString() });
      setLoading(false);
      return;
    }

    try {
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
        setJobScores((prev) => ({ ...prev, [jobId]: res.jobVersion.match_score }));
        recordJobVersion(res.jobVersion.match_score);
      }
      addActivity({
        id: `job-${res.jobVersion.id}`,
        type: "job_match",
        title: `${job.label} 직무 맞춤 분석`,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-[14px] text-[#6B7280]">원하는 직무를 선택하면 경험을 맞춤 최적화합니다</p>
            </div>
          </div>
        </div>

        {/* Job Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[14px] font-medium text-[#1A1A1A]">직무 선택</label>
            {structuredId && (
              <button
                type="button"
                onClick={() => recalcAllScores()}
                disabled={scoresLoading}
                className="text-[12px] text-[#0052FF] hover:underline flex items-center gap-1 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scoresLoading ? "animate-spin" : ""}`} />
                매칭도 다시 계산
              </button>
            )}
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
                      setIsDropdownOpen(false);
                      runMatch(job.id);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#F9FAFB] transition-colors flex items-center justify-between"
                  >
                    <span className="text-[14px] text-[#1A1A1A]">{job.label}</span>
                    <span className="text-[13px] text-[#6B7280]">
                      매칭도 {scoresLoading ? "계산 중" : jobScores[job.id] != null ? `${jobScores[job.id]}%` : "—"}
                    </span>
                  </button>
                ))}
              </div>
            )}
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

        {/* Analysis Result */}
        {selectedJob ? (
          <div className="space-y-4">
            {/* Matching Score */}
            <div className="bg-[#0052FF] rounded-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-[18px] font-semibold">매칭 분석 결과</h2>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[48px] font-bold">
                  {loading ? "..." : `${result?.match_score ?? (selectedJob ? jobScores[selectedJob] : null) ?? 0}%`}
                </span>
                <span className="text-[16px] opacity-80">매칭도</span>
              </div>
              <p className="text-[14px] opacity-90">
                {loading ? "분석 중..." : getMatchFeedbackText(result?.match_score ?? (selectedJob ? jobScores[selectedJob] : null), selectedJobData?.label)}
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
        ) : (
          <div className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-lg p-12 text-center">
            <div className="w-12 h-12 bg-[#F9FAFB] rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-[#9CA3AF]" />
            </div>
            <p className="text-[15px] text-[#6B7280]">
              직무를 선택하면 맞춤 분석이 시작됩니다
            </p>
            {!structuredId && (
              <p className="text-[12px] text-[#9CA3AF] mt-2">
                먼저 인터뷰를 완료해 구조화 결과를 생성해 주세요.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
