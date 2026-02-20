import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Modal } from "../components/Modal";
import { Download, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { getCachedOnboardingDraft, loadOnboardingDraft } from "../../lib/onboardingStore";
import { getDashboardState } from "../../lib/dashboardState";

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

  useEffect(() => {
    void loadOnboardingDraft().then((draft) => {
      setOnboarding(draft);
    });
    setJobFitScore(getDashboardState().summary.lastMatchScore ?? 78);
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

  const parsedStar = parseStarSummary(interviewResult?.summary ?? "");
  const usedSituation = parsedStar.situation || onboarding.payload.experience;
  const usedTask = parsedStar.task;
  const usedAction = parsedStar.action;
  const usedResult = parsedStar.result;

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

        <div className="grid grid-cols-3 gap-6">
          {/* Left - Main Content */}
          <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-1">
                {onboarding.payload.achievement
                  ? onboarding.payload.achievement.split("\n")[0].slice(0, 60)
                  : "재고 관리 프로세스 개선을 통한 폐기율 감소"}
              </h2>
              <p className="text-[13px] text-[#6B7280]">
                {onboarding.payload.name || "사용자"} · {onboarding.payload.targetJob || "직무 미입력"}
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
                <p className="text-[14px] text-[#374151] leading-[1.6]">
                  {usedAction ||
                    "선입선출 원칙 도입, 체크리스트 정착, 팀 협업 프로세스 개선 등 실행 중심으로 문제를 해결했습니다."}
                </p>
              </div>

              {/* Result */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#0052FF] mb-2">결과 (Result)</h3>
                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-4">
                  <p className="text-[14px] text-[#374151] leading-[1.6]">
                    {usedResult || "핵심 성과를 수치와 근거 중심으로 정리해 전달력을 높였습니다."}
                  </p>
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
                  <span className="font-semibold">{Math.round(jobFitScore)}점</span>
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
                  <span className="text-[13px] font-semibold text-[#0052FF]">{Math.round(jobFitScore)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0052FF]" style={{ width: `${Math.max(0, Math.min(100, Math.round(jobFitScore)))}%` }} />
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
              <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">개선 제안</h3>
              <ul className="space-y-2">
                {(interviewResult?.feedback?.length ? interviewResult.feedback : ["구체적인 기간/수치를 보강하면 더 설득력 있습니다."])
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

function parseStarSummary(summary: string) {
  const lines = summary.split("\n");
  const pick = (prefixes: string[]) => {
    const line = lines.find((l) => prefixes.some((p) => l.trim().startsWith(p)));
    if (!line) return "";
    const idx = line.indexOf(":");
    return idx >= 0 ? line.slice(idx + 1).trim() : line.trim();
  };
  return {
    situation: pick(["S(상황)", "Situation"]),
    task: pick(["T(과제)", "Task"]),
    action: pick(["A(행동)", "Action"]),
    result: pick(["R(결과)", "Result"]),
  };
}
