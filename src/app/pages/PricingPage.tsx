import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../../lib/api";

type PlanId = "free" | "premium" | "b2b";

export function PricingPage() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [updating, setUpdating] = useState<PlanId | null>(null);

  useEffect(() => {
    apiFetch<{ currentPlan: PlanId }>("/plans")
      .then((res) => setCurrentPlan(res.currentPlan))
      .catch(() => {});
  }, []);

  const handleSelect = async (planId: PlanId) => {
    if (planId === currentPlan) return;
    setUpdating(planId);
    try {
      const res = await apiFetch<{ currentPlan: PlanId }>("/plans/upgrade", {
        method: "POST",
        body: JSON.stringify({ plan: planId }),
      });
      setCurrentPlan(res.currentPlan);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[900px]">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
          </button>
          <div>
            <h1 className="text-[24px] font-semibold text-[#1A1A1A] mb-1">💳 요금제 안내</h1>
            <p className="text-[14px] text-[#6B7280]">
              현재 플랜에 따라 사용 가능한 기능이 달라집니다.
            </p>
          </div>
        </div>

        <p className="text-[14px] text-[#6B7280] mb-8">
          프리미엄 또는 B2B 플랜으로 업그레이드하면 제한 없이 모든 기능을 활용할 수 있어요.
        </p>

        {/* 무료 플랜 */}
        <section className="mb-8 border border-[#E5E7EB] rounded-xl p-6 bg-white">
          <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span>🟢</span> 무료 플랜
            {currentPlan === "free" && (
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] font-medium">
                현재 플랜
              </span>
            )}
          </h2>
          <ul className="space-y-1.5 text-[14px] text-[#4B5563] mb-3">
            <li><strong className="text-[#1A1A1A]">분석 횟수:</strong> 하루 최대 3회</li>
            <li><strong className="text-[#1A1A1A]">사용 가능 기능:</strong> 기본 분석, AI 추천</li>
          </ul>
          <p className="text-[13px] font-medium text-[#1A1A1A] mb-1">제한 사항:</p>
          <ul className="list-disc list-inside text-[13px] text-[#6B7280] mb-3 space-y-0.5">
            <li>직무 맞춤 리포트 제공 불가</li>
            <li>상세 분석 리포트 다운로드 불가</li>
          </ul>
          <p className="text-[13px] text-[#6B7280] italic">추천: 처음 체험하는 개인 사용자</p>
          {currentPlan !== "free" && (
            <button
              onClick={() => handleSelect("free")}
              disabled={updating === "free"}
              className="mt-4 w-full py-2.5 rounded-lg text-[14px] font-medium bg-[#F3F4F6] text-[#6B7280]"
            >
              무료로 변경
            </button>
          )}
        </section>

        {/* 프리미엄 플랜 */}
        <section className="mb-8 border border-[#0052FF] rounded-xl p-6 bg-[#FAFCFF]">
          <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span>🔵</span> 프리미엄 플랜
            {currentPlan === "premium" && (
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] font-medium">
                현재 플랜
              </span>
            )}
          </h2>
          <ul className="space-y-1.5 text-[14px] text-[#4B5563] mb-3">
            <li><strong className="text-[#1A1A1A]">분석 횟수:</strong> 무제한</li>
          </ul>
          <p className="text-[13px] font-medium text-[#1A1A1A] mb-1">주요 기능:</p>
          <ul className="list-disc list-inside text-[13px] text-[#6B7280] mb-2 space-y-0.5">
            <li>직무 맞춤 리포트 전체 제공</li>
            <li>경험/프로젝트 기반 상세 분석</li>
            <li>AI 키워드 추천 및 스킬 분석</li>
          </ul>
          <p className="text-[13px] font-medium text-[#1A1A1A] mb-1">추가 혜택:</p>
          <ul className="list-disc list-inside text-[13px] text-[#6B7280] mb-3 space-y-0.5">
            <li>분석 결과 PDF/CSV 다운로드</li>
            <li>향상된 AI 피드백 및 문장 개선 기능</li>
          </ul>
          <p className="text-[13px] text-[#6B7280] italic mb-4">추천: 개인 포트폴리오 강화, 직무 맞춤 리포트를 최대한 활용하고 싶은 사용자</p>
          <button
            onClick={() => handleSelect("premium")}
            disabled={currentPlan === "premium" || updating === "premium"}
            className="w-full py-2.5 rounded-lg text-[14px] font-medium bg-[#0052FF] hover:bg-[#0047E0] text-white disabled:bg-[#9CB7FF] disabled:cursor-not-allowed transition-colors"
          >
            {currentPlan === "premium" ? "현재 사용 중" : updating === "premium" ? "변경 중..." : "프리미엄으로 업그레이드"}
          </button>
        </section>

        {/* B2B 플랜 */}
        <section className="mb-8 border border-[#7C3AED] rounded-xl p-6 bg-[#FAF5FF]">
          <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span>🟣</span> B2B 플랜 (팀/기업용)
            {currentPlan === "b2b" && (
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] font-medium">
                현재 플랜
              </span>
            )}
          </h2>
          <ul className="space-y-1.5 text-[14px] text-[#4B5563] mb-3">
            <li><strong className="text-[#1A1A1A]">분석 횟수:</strong> 무제한, 팀 단위 사용 가능</li>
          </ul>
          <p className="text-[13px] font-medium text-[#1A1A1A] mb-1">주요 기능:</p>
          <ul className="list-disc list-inside text-[13px] text-[#6B7280] mb-2 space-y-0.5">
            <li>프리미엄 기능 포함</li>
            <li>팀원별 분석 데이터 통합 관리</li>
            <li>기업 맞춤 리포트 및 API 연동</li>
          </ul>
          <p className="text-[13px] font-medium text-[#1A1A1A] mb-1">추가 혜택:</p>
          <ul className="list-disc list-inside text-[13px] text-[#6B7280] mb-3 space-y-0.5">
            <li>전용 고객 지원 및 온보딩</li>
            <li>조직 단위 AI 분석 전략 지원</li>
          </ul>
          <p className="text-[13px] text-[#6B7280] italic mb-4">추천: HR, 채용, 교육 담당자 등 팀/기업 단위 분석 필요</p>
          <button
            onClick={() => handleSelect("b2b")}
            disabled={currentPlan === "b2b" || updating === "b2b"}
            className="w-full py-2.5 rounded-lg text-[14px] font-medium bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:bg-[#C4B5FD] disabled:cursor-not-allowed transition-colors"
          >
            {currentPlan === "b2b" ? "현재 사용 중" : updating === "b2b" ? "변경 중..." : "B2B 문의"}
          </button>
        </section>

        {/* 참고 */}
        <section className="border border-[#E5E7EB] rounded-lg p-4 bg-[#FAFAFA]">
          <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-2">🔔 참고</h3>
          <ul className="text-[13px] text-[#6B7280] space-y-1">
            <li>• 결제/구독 상태는 플랜 값에 따라 자동 제어됩니다.</li>
            <li>• 업그레이드 시 즉시 모든 기능 사용 가능합니다.</li>
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}
