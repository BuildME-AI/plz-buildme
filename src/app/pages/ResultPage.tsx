import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { CheckCircle2, ArrowRight, Edit3, ArrowLeft } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { addActivity, recordAnalysis } from "../../lib/dashboardState";
import { getCachedOnboardingDraft, loadOnboardingDraft } from "../../lib/onboardingStore";

export function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [structured, setStructured] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(() => getCachedOnboardingDraft());

  const structuredId =
    (location.state as any)?.structuredId ?? localStorage.getItem("buildme.structuredId");

  useEffect(() => {
    void loadOnboardingDraft().then((draft) => {
      setOnboarding(draft);
    });
  }, []);

  useEffect(() => {
    if (!structuredId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch<{ structured: any }>(`/structured/${structuredId}`)
      .then((res) => {
        setStructured(res.structured);
        localStorage.setItem("buildme.structuredId", res.structured.id);
        if (typeof res.structured.overall_score === "number") {
          recordAnalysis(res.structured.overall_score);
        }
        addActivity({
          id: `analysis-${res.structured.id}`,
          type: "analysis",
          title: res.structured.situation?.slice(0, 40) || "경험 분석 완료",
          createdAt: new Date().toISOString(),
        });
      })
      .finally(() => setLoading(false));
  }, [structuredId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-[15px] text-[#6B7280] mt-4">결과를 불러오는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/interview")}
              className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
            <div className="flex-1">
              <h1 className="text-[24px] font-semibold text-[#1A1A1A]">경험 구조화 완료</h1>
            </div>
            <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span className="text-[14px] text-[#10B981] font-medium">
                점수 {structured?.overall_score ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* STAR Structure Card */}
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-5 mb-6">
          <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-2">온보딩 기반 요약</h2>
          <p className="text-[14px] text-[#4B5563] mb-1">
            <span className="font-medium">이름:</span> {onboarding.payload.name || "-"} /{" "}
            <span className="font-medium">직무:</span> {onboarding.payload.targetJob || "-"}
          </p>
          <p className="text-[14px] text-[#4B5563] leading-[1.6]">
            {onboarding.payload.achievement
              ? onboarding.payload.achievement.slice(0, 180)
              : "강조 성과가 입력되지 않았습니다."}
            {onboarding.payload.achievement.length > 180 ? "..." : ""}
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 mb-6">
          <div className="space-y-6">
            {/* Situation */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#0052FF] text-[12px] font-medium px-3 py-1 rounded-full mb-3">
                Situation
              </div>
              <p className="text-[15px] text-[#374151] leading-[1.6]">
                {structured?.situation ?? "구조화 결과가 없습니다. 인터뷰를 먼저 완료해 주세요."}
              </p>
            </div>

            {/* Task */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#F3E8FF] text-[#7C3AED] text-[12px] font-medium px-3 py-1 rounded-full mb-3">
                Role & Action
              </div>
              <p className="text-[15px] text-[#374151] leading-[1.6]">
                {structured?.role_and_action ?? ""}
              </p>
            </div>

            {/* Action */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#DBEAFE] text-[#3B82F6] text-[12px] font-medium px-3 py-1 rounded-full mb-3">
                Growth
              </div>
              <p className="text-[15px] text-[#374151] leading-[1.6]">
                {structured?.growth ?? ""}
              </p>
            </div>

            {/* Result */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FEF3C7] text-[#F59E0B] text-[12px] font-medium px-3 py-1 rounded-full mb-3">
                Result
              </div>
              <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-4">
                <p className="text-[15px] text-[#374151] leading-[1.6] mb-2">
                  {structured?.result ?? ""}
                </p>
                {Array.isArray(structured?.improvement_suggestions) && structured.improvement_suggestions.length > 0 && (
                  <p className="text-[13px] text-[#F59E0B]">
                    💡 {structured.improvement_suggestions[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#FAFAFA] rounded-lg p-4">
            <p className="text-[13px] text-[#6B7280] mb-1">구체성</p>
            <p className="text-[24px] font-semibold text-[#1A1A1A]">{structured?.specificity_score ?? 0}점</p>
          </div>
          <div className="bg-[#FAFAFA] rounded-lg p-4">
            <p className="text-[13px] text-[#6B7280] mb-1">성과 중심</p>
            <p className="text-[24px] font-semibold text-[#1A1A1A]">{structured?.impact_score ?? 0}점</p>
          </div>
          <div className="bg-[#FAFAFA] rounded-lg p-4">
            <p className="text-[13px] text-[#6B7280] mb-1">직무 적합도</p>
            <p className="text-[24px] font-semibold text-[#1A1A1A]">{structured?.job_fit_score ?? 0}점</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/interview")}
            className="flex items-center gap-2 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#1A1A1A] px-5 py-2.5 rounded-lg font-medium text-[15px] transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            수정하기
          </button>
          <button
            onClick={() => navigate("/job-match", { state: { structuredId: structured?.id } })}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0052FF] hover:bg-[#0047E0] text-white px-5 py-2.5 rounded-lg font-medium text-[15px] transition-colors"
          >
            직무 맞춤 분석하기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
