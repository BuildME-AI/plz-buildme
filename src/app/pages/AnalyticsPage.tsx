import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { TrendingUp, Target, Award, ArrowLeft, RotateCcw } from "lucide-react";
import { getDashboardState, resetSummary } from "../../lib/dashboardState";
import { apiFetch } from "../../lib/api";

export function AnalyticsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [summary, setSummary] = useState(() => getDashboardState().summary);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setSummary(getDashboardState().summary);
  }, []);

  useEffect(() => {
    const structuredId = (location.state as any)?.structuredId ?? localStorage.getItem("buildme.structuredId");
    if (!structuredId) {
      setImprovements([]);
      return;
    }
    apiFetch<{ structured: any }>(`/structured/${structuredId}`)
      .then((res) => {
        if (Array.isArray(res.structured.improvement_suggestions)) {
          setImprovements(res.structured.improvement_suggestions);
        } else {
          setImprovements([]);
        }
      })
      .catch(() => {
        setImprovements([]);
      });
  }, [location.state]);

  const handleReset = async () => {
    setResetting(true);
    try {
      await apiFetch<{ ok: boolean }>("/analytics/reset", { method: "POST" });
      resetSummary();
      setSummary(getDashboardState().summary);
      setImprovements([]);
    } finally {
      setResetting(false);
    }
  };
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
          <button
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E7EB] text-[13px] text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            세부 분석 초기화
          </button>
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
              { label: "구체성", score: summary.averageScore || 0, color: "#0052FF" },
              { label: "성과 중심", score: summary.averageScore || 0, color: "#10B981" },
              { label: "직무 적합도", score: summary.lastMatchScore ?? 0, color: "#F59E0B" },
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
