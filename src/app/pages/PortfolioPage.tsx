import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Modal } from "../components/Modal";
import { Download, CheckCircle2, ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { getCachedOnboardingDraft, loadOnboardingDraft } from "../../lib/onboardingStore";
import { decrementJobVersion, getDashboardState, removeActivity } from "../../lib/dashboardState";
import { getPortfolioVersions, removePortfolioVersion, type PortfolioVersion } from "../../lib/portfolioStore";
import { parseStarSections } from "../../lib/star";

type InterviewResultPayload = {
  summary: string;
  feedback: string[];
  score: number;
  specificityScore?: number;
  impactScore?: number;
};

export function PortfolioPage() {
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);
  const [onboarding, setOnboarding] = useState(() => getCachedOnboardingDraft());
  const [interviewResult, setInterviewResult] = useState<InterviewResultPayload | null>(null);
  const [jobFitScore, setJobFitScore] = useState<number>(() => getDashboardState().summary.lastMatchScore ?? 78);
  const [storedVersions, setStoredVersions] = useState<PortfolioVersion[]>(() => getPortfolioVersions());
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  useEffect(() => {
    void loadOnboardingDraft().then((draft) => {
      setOnboarding(draft);
    });
    const latestDashboard = getDashboardState();
    setJobFitScore(latestDashboard.summary.lastMatchScore ?? 78);
    setStoredVersions(getPortfolioVersions());
    const raw = localStorage.getItem("buildme.interviewResult");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as InterviewResultPayload;
        if (typeof parsed.summary === "string" && typeof parsed.score === "number") {
          setInterviewResult(parsed);
        }
      } catch {
        // ignore malformed cache
      }
    }
  }, []);

  const allVersions = useMemo(
    () =>
      [...storedVersions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [storedVersions],
  );

  useEffect(() => {
    if (!selectedVersionId && allVersions.length > 0) {
      setSelectedVersionId(allVersions[0].id);
      return;
    }
    if (selectedVersionId && !allVersions.some((version) => version.id === selectedVersionId)) {
      setSelectedVersionId(allVersions[0]?.id ?? null);
    }
  }, [allVersions, selectedVersionId]);

  const selectedVersion = allVersions.find((version) => version.id === selectedVersionId) ?? allVersions[0];
  const starSourceText = selectedVersion?.optimizedParagraph || interviewResult?.summary || onboarding.payload.experience || "";
  const parsedStar = parseStarSections(starSourceText);
  const usedSituation =
    selectedVersion?.situation ||
    parsedStar.situation ||
    onboarding.payload.experience ||
    "프로젝트 진행 중 해결이 필요한 상황이 있었습니다.";
  const usedTask =
    selectedVersion?.task ||
    parsedStar.task ||
    "문제를 해결하고 목표를 달성하기 위해 우선순위를 정하고 실행 계획을 수립했습니다.";
  const usedAction =
    selectedVersion?.action ||
    parsedStar.action ||
    "실행 단계를 정의하고 데이터를 기반으로 개선안을 적용하며 협업으로 완성도를 높였습니다.";
  const usedResult =
    selectedVersion?.result || parsedStar.result || "정량/정성 성과를 통해 개선 효과를 확인했습니다.";
  const actionItems = toBulletItems(usedAction);
  const resultItems = toBulletItems(usedResult);
  const handleDeleteVersion = (version: PortfolioVersion) => {
    const ok = window.confirm("이 포트폴리오 버전을 삭제할까요?");
    if (!ok) return;

    removePortfolioVersion(version.id);
    if (version.activityId) {
      removeActivity(version.activityId);
    }

    const remaining = getPortfolioVersions().filter((item) => item.id !== version.id);
    const nextLastScore = remaining[0]?.matchScore ?? null;
    decrementJobVersion(nextLastScore);

    const latestDashboard = getDashboardState();
    setJobFitScore(latestDashboard.summary.lastMatchScore ?? 78);
    setStoredVersions(getPortfolioVersions());
    if (selectedVersionId === version.id) {
      setSelectedVersionId(remaining[0]?.id ?? null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/job-match")}
              className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
            <div className="flex-1">
              <h1 className="text-[24px] font-semibold text-[#1A1A1A]">최종 포트폴리오</h1>
              <p className="text-[14px] text-[#6B7280]">
                {(onboarding.payload.targetJob || "콘텐츠 마케팅") + " 직무 맞춤"}
              </p>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 bg-[#0052FF] hover:bg-[#0047E0] text-white px-5 py-2.5 rounded-lg font-medium text-[15px] transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF 내보내기
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-semibold text-[#1A1A1A]">완성된 포트폴리오</h2>
            <span className="text-[13px] text-[#6B7280]">총 {allVersions.length}개</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allVersions.map((version) => {
              const active = selectedVersion?.id === version.id;
              return (
                <div
                  key={version.id}
                  className={`text-left border rounded-lg p-4 transition-colors ${
                    active ? "border-[#0052FF] bg-[#EEF2FF]" : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => setSelectedVersionId(version.id)} className="flex-1 text-left min-w-0">
                      <p className="text-[14px] font-medium text-[#1A1A1A] truncate">{version.title}</p>
                      <p className="text-[12px] text-[#6B7280] mt-1">{version.targetRole}</p>
                      <p className="text-[12px] text-[#6B7280] mt-1">{new Date(version.createdAt).toLocaleString()}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVersion(version)}
                      className="p-2 rounded-md text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEF2F2]"
                      aria-label="포트폴리오 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {allVersions.length === 0 && (
            <div className="bg-white border border-dashed border-[#E5E7EB] rounded-lg p-6 text-center text-[14px] text-[#6B7280]">
              아직 생성된 포트폴리오가 없습니다. 직무 맞춤 분석에서 새 포트폴리오를 생성해 주세요.
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left - Main Content */}
          <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-1">
                {selectedVersion?.title || "최종 포트폴리오"}
              </h2>
              <p className="text-[13px] text-[#6B7280]">
                {onboarding.payload.name || "사용자"} · {selectedVersion?.targetRole || onboarding.payload.targetJob || "직무 미입력"}
              </p>
            </div>

            <div className="space-y-6">
              {/* Situation */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#0052FF] mb-2">상황 (Situation)</h3>
                <p className="text-[14px] text-[#374151] leading-[1.6]">
                  {usedSituation
                    ? usedSituation
                    : "카페 아르바이트 중 재고 관리 업무를 담당하며, 기존 수기 관리 방식으로 인해 재고 파악이 어렵고 폐기율이 높은 문제를 발견했습니다."}
                </p>
              </div>

              {/* Task */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#0052FF] mb-2">과제 (Task)</h3>
                <p className="text-[14px] text-[#374151] leading-[1.6]">
                  {usedTask || "재고 관리 프로세스를 체계화하여 폐기율을 낮추고 효율적인 재고 회전율을 달성하는 것이 목표였습니다."}
                </p>
              </div>

              {/* Action */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#0052FF] mb-2">행동 (Action)</h3>
                {actionItems.length > 0 ? (
                  <ul className="space-y-2">
                    {actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#0052FF] mt-1">•</span>
                        <p className="text-[14px] text-[#374151] leading-[1.6]">{item}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[14px] text-[#374151] leading-[1.6]">
                    선입선출 원칙 도입, 체크리스트 정착, 팀 협업 프로세스 개선 등 실행 중심으로 문제를
                    해결했습니다.
                  </p>
                )}
              </div>

              {/* Result */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#0052FF] mb-2">결과 (Result)</h3>
                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-4">
                  {resultItems.length > 0 ? (
                    <ul className="space-y-2">
                      {resultItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                          <p className="text-[14px] text-[#374151] leading-[1.6]">{item}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[14px] text-[#374151] leading-[1.6]">
                      핵심 성과를 수치와 근거 중심으로 정리해 전달력을 높였습니다.
                    </p>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-2">핵심 역량</h3>
                <div className="flex flex-wrap gap-2">
                  {["데이터 분석", "프로세스 개선", "팀 협업", "문제 해결", "성과 측정"].map((skill, i) => (
                    <span
                      key={i}
                      className="bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] px-3 py-1.5 rounded-lg text-[13px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div className="space-y-4">
            {/* Score Card */}
            <div className="bg-[#10B981] text-white rounded-lg p-6">
              <h3 className="text-[15px] font-medium mb-3">분석 점수</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[40px] font-bold">{interviewResult?.score ?? 82}</span>
                <span className="text-[16px] opacity-80">/100</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="opacity-90">구체성</span>
                  <span className="font-semibold">{Math.round(interviewResult?.specificityScore ?? 85)}점</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="opacity-90">직무 적합도</span>
                  <span className="font-semibold">{Math.round(selectedVersion?.matchScore ?? jobFitScore)}점</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="opacity-90">성과 중심</span>
                  <span className="font-semibold">{Math.round(interviewResult?.impactScore ?? 84)}점</span>
                </div>
              </div>
            </div>

            {/* Job Match */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
              <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">직무 매칭도</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#6B7280]">{onboarding.payload.targetJob || "콘텐츠 마케팅"}</span>
                  <span className="text-[13px] font-semibold text-[#0052FF]">{Math.round(selectedVersion?.matchScore ?? jobFitScore)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0052FF]"
                    style={{ width: `${Math.max(0, Math.min(100, Math.round(selectedVersion?.matchScore ?? jobFitScore)))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
              <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">개선 제안</h3>
              <ul className="space-y-2">
                {((selectedVersion?.feedback?.length ? selectedVersion.feedback : interviewResult?.feedback) || [
                  "구체적인 기간/수치를 보강하면 더 설득력 있습니다.",
                ])
                  .slice(0, 3)
                  .map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#F59E0B]">💡</span>
                      <p className="text-[13px] text-[#6B7280] leading-[1.5]">{tip}</p>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="PDF 내보내기">
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-[#10B981]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">내보내기 준비 완료</h3>
          <p className="text-[14px] text-[#6B7280] mb-6">
            포트폴리오가 PDF 형식으로 저장됩니다.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowExportModal(false)}
              className="flex-1 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] py-2.5 rounded-lg font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                setTimeout(() => setShowExportModal(false), 500);
              }}
              className="flex-1 bg-[#0052FF] hover:bg-[#0047E0] text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              다운로드
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function toBulletItems(value: string) {
  return value
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}
