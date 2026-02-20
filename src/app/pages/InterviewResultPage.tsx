import React from "react";
import { useLocation, useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { ArrowLeft, CheckCircle, MessageSquare, Star, ArrowRight } from "lucide-react";

type InterviewResultPayload = {
  summary: string;
  feedback: string[];
  score: number;
  level: "상" | "중" | "하";
  questions: string[];
};

const getMockResultData = (): InterviewResultPayload => ({
  summary: "저장된 요약 데이터가 없습니다. 카페 아르바이트 경험을 바탕으로, 재고 관리 프로세스를 개선하여 폐기율을 줄였습니다. 이 과정에서 보여준 문제 해결 능력과 실행력이 돋보입니다.",
  feedback: [
    "데이터를 찾을 수 없어 예시 피드백을 보여줍니다.",
    "STAR 구조에 맞춰 답변을 잘 구성했습니다.",
    "성과를 수치로 표현하면 신뢰도를 높일 수 있습니다.",
  ],
  score: 88,
  level: "중",
  questions: [
    "이 경험을 통해 무엇을 배웠나요?",
    "가장 어려웠던 점은 무엇이었고, 어떻게 극복했나요?",
  ],
});

const getSavedResultData = (): InterviewResultPayload | null => {
  const raw = localStorage.getItem("buildme.interviewResult");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as InterviewResultPayload;
    if (
      typeof parsed?.summary === "string" &&
      Array.isArray(parsed?.feedback) &&
      typeof parsed?.score === "number" &&
      (parsed?.level === "상" || parsed?.level === "중" || parsed?.level === "하") &&
      Array.isArray(parsed?.questions)
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
};

export function InterviewResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // location.state가 없으면 (페이지 새로고침 등) localStorage를 우선 확인합니다.
  const routeState = location.state as InterviewResultPayload | null;
  const fallback = getSavedResultData() || getMockResultData();
  const { summary, feedback, score, level, questions } = routeState || fallback;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[800px] mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
            <div>
              <h1 className="text-[24px] font-semibold text-[#1A1A1A]">AI 인터뷰 결과</h1>
              <p className="text-[14px] text-[#6B7280]">답변을 기반으로 생성된 분석 리포트입니다.</p>
            </div>
          </div>
        </div>

        {/* Score Section */}
        <div className="bg-[#0052FF] rounded-lg p-6 text-white mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5" />
            <h2 className="text-[18px] font-semibold">종합 점수</h2>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[48px] font-bold">{score}%</span>
            <span className="text-[16px] opacity-80">완성도</span>
          </div>
          <p className="text-[14px] font-medium mb-1">수준 평가: {level}</p>
          <p className="text-[14px] opacity-90">
            답변의 구체성, 구조, 성과 표현을 바탕으로 측정된 점수입니다.
          </p>
        </div>

        <div className="space-y-6">
          {/* Summary Section */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">경험 요약 (STAR 기반)</h3>
            <div className="space-y-3 text-[14px] text-[#4B5563] leading-[1.7] whitespace-pre-wrap">
              {summary}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">AI 피드백</h3>
            <div className="space-y-2">
              {feedback.map((fb: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                  <p className="text-[14px] text-[#4B5563]">{fb}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Questions Section */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">추가 추천 질문</h3>
            <p className="text-[13px] text-[#6B7280] mb-3">
              다음 질문에 대한 답변을 준비하면 경험을 더 깊이있게 만들 수 있습니다.
            </p>
            <div className="space-y-2">
              {questions.map((q: string, i: number) => (
                <div key={i} className="flex items-start gap-2 bg-[#FAFAFA] p-3 rounded-md">
                  <MessageSquare className="w-4 h-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <p className="text-[14px] text-[#4B5563]">{q}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => navigate("/job-match")}
              className="flex items-center gap-2 bg-[#0052FF] hover:bg-[#0047E0] text-white px-6 py-3 rounded-lg font-medium text-[15px] transition-colors"
            >
              직무 맞춤 분석 계속하기
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}