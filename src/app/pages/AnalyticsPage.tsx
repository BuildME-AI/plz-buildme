import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { TrendingUp, Target, Award, ArrowLeft } from "lucide-react";
import { getDashboardState } from "../../lib/dashboardState";
import { apiFetch } from "../../lib/api";

type InterviewResultCache = {
  score?: number;
  specificityScore?: number;
  impactScore?: number;
  feedback?: string[];
};

export function AnalyticsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [summary, setSummary] = useState(() => getDashboardState().summary);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [detailedScores, setDetailedScores] = useState({
    specificity: summary.averageScore || 0,
    impact: summary.averageScore || 0,
    jobFit: summary.lastMatchScore ?? 0,
  });

  useEffect(() => {
    setSummary(getDashboardState().summary);
  }, []);

  const applyInterviewFallback = () => {
    const interviewResultRaw = localStorage.getItem("buildme.interviewResult");
    if (!interviewResultRaw) {
      setImprovements([]);
      return;
    }
    try {
      const parsed = JSON.parse(interviewResultRaw) as InterviewResultCache;
      setDetailedScores((prev) => ({
        specificity: typeof parsed.specificityScore === "number" ? Math.round(parsed.specificityScore) : prev.specificity,
        impact: typeof parsed.impactScore === "number" ? Math.round(parsed.impactScore) : prev.impact,
        jobFit: prev.jobFit,
      }));
      const feedbacks = Array.isArray(parsed.feedback) ? parsed.feedback : [];
      const suggestions = feedbacks.filter((item) => typeof item === "string" && item.includes("개선"));
      setImprovements(suggestions);
      if (typeof parsed.score === "number") {
        setSummary((prev) => {
          if (prev.totalAnalyses > 0) return prev;
          return {
            ...prev,
            totalAnalyses: 1,
            averageScore: Math.round(parsed.score),
          };
        });
      }
    } catch {
      setImprovements([]);
    }
  };

  useEffect(() => {
    const structuredId = (location.state as any)?.structuredId ?? localStorage.getItem("buildme.structuredId");
    if (!structuredId) {
      applyInterviewFallback();
      return;
    }
    apiFetch<{ structured: any }>(`/structured/${structuredId}`)
      .then((res) => {
        if (Array.isArray(res.structured.improvement_suggestions)) {
          setImprovements(res.structured.improvement_suggestions);
        } else {
          setImprovements([]);
        }
        // AI 구조화 결과 점수를 세부분석에 직접 반영
        setDetailedScores({
          specificity:
            typeof res.structured.specificity_score === "number"
              ? Math.round(res.structured.specificity_score)
              : summary.averageScore || 0,
          impact:
            typeof res.structured.impact_score === "number"
              ? Math.round(res.structured.impact_score)
              : summary.averageScore || 0,
          jobFit:
            typeof res.structured.job_fit_score === "number"
              ? Math.round(res.structured.job_fit_score)
              : summary.lastMatchScore ?? 0,
        });
      })
      .catch(() => {
        applyInterviewFallback();
      });
  }, [location.state, summary.averageScore, summary.lastMatchScore]);
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
            <div>
              <h1 className="text-[24px] font-semibold text-[#1A1A1A] mb-1">분석 리포트</h1>
              <p className="text-[14px] text-[#6B7280]">포트폴리오 품질과 개선 포인트를 확인하세요</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0052FF] text-white rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-[15px] font-medium">평균 점수</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[36px] font-bold">{summary.averageScore}</span>
              <span className="text-[16px] opacity-80">/100</span>
            </div>
            <p className="text-[13px] opacity-80 mt-1">전체 경험 기준</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-[#10B981]" />
              <h3 className="text-[15px] font-medium text-[#1A1A1A]">완료된 경험</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[36px] font-bold text-[#1A1A1A]">
                {summary.totalAnalyses}
              </span>
              <span className="text-[16px] text-[#6B7280]">개</span>
            </div>
            <p className="text-[13px] text-[#10B981] mt-1">+1 이번 달</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="text-[15px] font-medium text-[#1A1A1A]">최고 점수</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[36px] font-bold text-[#1A1A1A]">
                {summary.lastMatchScore ?? 0}
              </span>
              <span className="text-[16px] text-[#6B7280]">점</span>
            </div>
            <p className="text-[13px] text-[#6B7280] mt-1">최근 매칭 기준</p>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
          <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-5">세부 분석</h2>

          <div className="space-y-4">
            {[
              { label: "구체성", score: detailedScores.specificity || 0, color: "#0052FF" },
              { label: "성과 중심", score: detailedScores.impact || 0, color: "#10B981" },
              { label: "직무 적합도", score: detailedScores.jobFit || 0, color: "#F59E0B" },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] text-[#1A1A1A] font-medium">{item.label}</span>
                  <span className="text-[14px] font-semibold" style={{ color: item.color }}>
                    {item.score}점
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: item.color, width: `${Math.min(item.score, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-6">
          <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">개선 제안</h2>
          {improvements.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF]">현재 표시할 개선 제안이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {improvements.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#0052FF] mt-1">•</span>
                  <p className="text-[14px] text-[#6B7280] leading-[1.5]">{tip}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
