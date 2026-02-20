import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { ArrowRight, TrendingUp, FileText, Clock, Plus, Trash2 } from "lucide-react";
import { decrementJobVersion, getDashboardState, removeActivity } from "../../lib/dashboardState";
import { getCachedOnboardingDraft, loadOnboardingDraft } from "../../lib/onboardingStore";
import { getPortfolioVersions, removePortfolioVersionByActivityId } from "../../lib/portfolioStore";

export function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(() => getDashboardState().summary);
  const [activities, setActivities] = useState(() => getDashboardState().activities);
  const [onboarding, setOnboarding] = useState(() => getCachedOnboardingDraft());

  const refreshState = () => {
    const state = getDashboardState();
    setSummary(state.summary);
    setActivities(state.activities);
  };

  useEffect(() => {
    refreshState();
    void loadOnboardingDraft().then((draft) => {
      setOnboarding(draft);
    });
  }, []);

  const handleDeleteActivity = (e: React.MouseEvent, activityId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const target = activities.find((item) => item.id === activityId);
    if (target?.type === "job_match") {
      removePortfolioVersionByActivityId(activityId);
      const remaining = getPortfolioVersions();
      const nextLastScore = remaining[0]?.matchScore ?? null;
      decrementJobVersion(nextLastScore);
    }
    removeActivity(activityId);
    refreshState();
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold text-[#1A1A1A] mb-1">
            대시보드
          </h1>
          <p className="text-[15px] text-[#6B7280]">현재 진행 상황을 확인하고 다음 단계를 시작하세요</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate("/interview")}
            className="bg-[#0052FF] hover:bg-[#0047E0] text-white p-6 rounded-lg text-left transition-colors group"
          >
            <Plus className="w-6 h-6 mb-3" />
            <p className="text-[16px] font-semibold mb-1">새 인터뷰 시작</p>
            <p className="text-[14px] text-white/80">경험을 입력하고 AI 인터뷰를 시작하세요</p>
          </button>

          <button
            onClick={() => navigate("/interview")}
            className="border border-[#E5E7EB] rounded-lg p-6 hover:border-[#D1D5DB] transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-6 h-6 text-[#6B7280]" />
              <span className="text-[13px] text-[#0052FF] font-medium">
                {summary.totalAnalyses > 0 ? "진행 중" : "대기"}
              </span>
            </div>
            <p className="text-[16px] font-semibold text-[#1A1A1A] mb-1">진행 중인 인터뷰</p>
            <p className="text-[14px] text-[#6B7280]">
              최근 분석 {summary.totalAnalyses > 0 ? `${summary.totalAnalyses}회` : "없음"}
            </p>
          </button>

          <button
            onClick={() => navigate("/portfolio")}
            className="border border-[#E5E7EB] rounded-lg p-6 hover:border-[#D1D5DB] transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-6 h-6 text-[#6B7280]" />
              <span className="text-[13px] text-[#6B7280]">
                {summary.totalJobVersions}개
              </span>
            </div>
            <p className="text-[16px] font-semibold text-[#1A1A1A] mb-1">완성된 포트폴리오</p>
            <p className="text-[14px] text-[#6B7280]">
              최근 매칭도 {summary.lastMatchScore ?? 0}%
            </p>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-5">
            <p className="text-[13px] text-[#6B7280] mb-1">평균 점수</p>
            <p className="text-[28px] font-semibold text-[#1A1A1A]">
              {summary.averageScore}
            </p>
          </div>
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-5">
            <p className="text-[13px] text-[#6B7280] mb-1">생성한 버전</p>
            <p className="text-[28px] font-semibold text-[#1A1A1A]">
              {summary.totalJobVersions}
            </p>
          </div>
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-5">
            <p className="text-[13px] text-[#6B7280] mb-1">매칭도</p>
            <p className="text-[28px] font-semibold text-[#1A1A1A]">
              {summary.lastMatchScore ?? 0}%
            </p>
          </div>
          <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-5">
            <p className="text-[13px] text-[#6B7280] mb-1">이번 달</p>
            <p className="text-[28px] font-semibold text-[#1A1A1A]">
              +{summary.totalAnalyses}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold text-[#1A1A1A]">온보딩 요약</h2>
            <span className="text-[13px] text-[#6B7280]">완료 단계 {onboarding.completedStep}/7</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-[#FAFAFA] rounded-lg p-4">
              <p className="text-[12px] text-[#6B7280] mb-1">이름</p>
              <p className="text-[14px] font-medium text-[#1A1A1A]">{onboarding.payload.name || "-"}</p>
            </div>
            <div className="bg-[#FAFAFA] rounded-lg p-4">
              <p className="text-[12px] text-[#6B7280] mb-1">목표 직무</p>
              <p className="text-[14px] font-medium text-[#1A1A1A]">{onboarding.payload.targetJob || "-"}</p>
            </div>
            <div className="bg-[#FAFAFA] rounded-lg p-4">
              <p className="text-[12px] text-[#6B7280] mb-1">활용 목적</p>
              <p className="text-[14px] font-medium text-[#1A1A1A]">{purposeLabel(onboarding.payload.purpose)}</p>
            </div>
          </div>
          <p className="text-[14px] text-[#4B5563] leading-[1.6]">
            {onboarding.payload.experience
              ? onboarding.payload.experience.slice(0, 180)
              : "아직 저장된 경험 요약이 없습니다. 온보딩에서 경험을 입력해 주세요."}
            {onboarding.payload.experience.length > 180 ? "..." : ""}
          </p>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-4">최근 활동</h2>
          <div className="bg-white border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
            {activities.length === 0 && (
              <div className="px-6 py-4 text-[14px] text-[#6B7280]">
                아직 기록된 활동이 없습니다. 온보딩을 완료하고 첫 인터뷰를 시작해 보세요.
              </div>
            )}
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors group"
              >
                <button
                  onClick={() => navigate("/analytics")}
                  className="flex-1 flex items-center justify-between text-left min-w-0"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] text-[#1A1A1A] font-medium mb-0.5 truncate">
                      {activity.title}
                    </p>
                    <p className="text-[13px] text-[#6B7280]">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#9CA3AF] flex-shrink-0 ml-2" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteActivity(e, activity.id)}
                  className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors flex-shrink-0"
                  aria-label="활동 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function purposeLabel(purpose: string) {
  if (purpose === "job") return "취업 지원";
  if (purpose === "career") return "이직 준비";
  if (purpose === "freelance") return "프리랜서 / 외주";
  if (purpose === "branding") return "개인 브랜딩";
  return "-";
}
