import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Sparkles, Send, ArrowLeft } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { addActivity, recordAnalysis } from "../../lib/dashboardState";

type ChatMsg = { role: "ai" | "user"; text: string };
type StepKey = (typeof STEP_KEYS)[number];
type StepEvaluation = {
  score: number;
  isSufficient: boolean;
  missingPoints: string[];
};
type InterviewResultPayload = {
  summary: string;
  feedback: string[];
  score: number;
  level: "상" | "중" | "하";
  questions: string[];
  specificityScore: number;
  impactScore: number;
};

const STEP_KEYS = ["company", "role", "duration", "problem", "action", "result"] as const;
const STEP_LABELS: Record<StepKey, string> = {
  company: "어디서 일했나요?",
  role: "어떤 역할을 맡았나요?",
  duration: "총 근무 기간은?",
  problem: "해결하려 한 문제나 과제는 무엇이었나요?",
  action: "구체적으로 어떤 행동을 취하셨나요?",
  result: "성과는 어떻게 나타났나요? (가능하면 수치로)",
};

const MOCK_FOLLOW_UPS: Record<string, string[]> = {
  company: ["어떤 산업군에 속한 기업이었나요?", "기업의 규모는 어느 정도였나요?", "근무하시면서 가장 인상 깊었던 점은 무엇인가요?"],
  role: ["구체적으로 어떤 팀에서 근무하셨나요?", "주요 책임은 무엇이었나요?", "혼자 일하셨나요, 아니면 팀으로 일하셨나요?"],
  duration: ["정확한 근무 기간을 년/월 단위로 알려주실 수 있나요?", "해당 기간 동안 풀타임으로 근무하셨나요?", "기간이 짧다면 그 이유는 무엇인가요?"],
  problem: ["그 문제가 발생한 구체적인 배경은 무엇인가요?", "해당 문제가 비즈니스에 어떤 부정적 영향을 주었나요?", "문제 해결이 왜 시급했나요?"],
  action: ["본인이 직접 주도한 행동은 무엇인가요?", "그 행동을 취한 구체적인 이유는 무엇인가요?", "다른 대안은 없었나요?"],
  result: ["성과를 수치로 표현할 수 있나요? (예: 20% 상승)", "그 결과가 팀이나 회사에 어떤 기여를 했나요?", "주변의 피드백은 어땠나요?"],
};

const RECOMMENDED_QUESTIONS_BY_STEP: Record<StepKey, string[]> = {
  company: ["당시 조직의 규모와 본인의 소속 팀 구조를 설명해 주세요."],
  role: ["본인이 맡은 핵심 책임 2가지를 사례와 함께 말해 주세요."],
  duration: ["프로젝트/근무 기간을 월 단위로 정리해 설명해 주세요."],
  problem: ["해결하려던 문제가 비즈니스에 어떤 영향을 주었는지 말해 주세요."],
  action: ["본인이 직접 실행한 행동을 우선순위 순으로 설명해 주세요."],
  result: ["성과를 전/후 수치(%, 시간, 비용)로 비교해 설명해 주세요."],
};

const STEP_ALT_QUESTIONS: Record<StepKey, string[]> = {
  company: ["어떤 회사/조직에서 해당 경험을 했나요?", "프로젝트가 진행된 조직 환경을 설명해 주세요."],
  role: ["그 경험에서 본인의 핵심 역할은 무엇이었나요?", "직접 책임진 업무 범위를 알려주세요."],
  duration: ["해당 경험은 어느 기간 동안 진행됐나요?", "시작/종료 시점을 기준으로 기간을 설명해 주세요."],
  problem: ["해결하려던 문제를 한 문장으로 정의해 주세요.", "당시 가장 시급했던 과제는 무엇이었나요?"],
  action: ["문제 해결을 위해 직접 실행한 행동을 말해 주세요.", "본인이 주도한 실행 단계를 순서대로 설명해 주세요."],
  result: ["결과가 어떻게 달라졌나요? 가능하면 수치로 말해 주세요.", "성과를 전후 비교 형태로 설명해 주세요."],
};

const initStepRecord = <T,>(initial: T): Record<StepKey, T> =>
  STEP_KEYS.reduce((acc, key) => {
    acc[key] = initial;
    return acc;
  }, {} as Record<StepKey, T>);

const pickRandom = (items: string[]) => items[Math.floor(Math.random() * items.length)];

const evaluateAnswer = (step: StepKey, text: string): StepEvaluation => {
  const normalized = text.trim();
  const missingPoints: string[] = [];
  const hasNumber = /\d/.test(normalized);

  if (normalized.length < 18) {
    missingPoints.push("설명이 짧아 맥락 파악이 어렵습니다");
  }

  if (step === "role" && !/(역할|책임|담당|주도|리드)/.test(normalized)) {
    missingPoints.push("본인의 역할/책임이 명확하지 않습니다");
  }
  if (step === "duration" && !/(년|월|주|기간|\d)/.test(normalized)) {
    missingPoints.push("근무/수행 기간 정보가 부족합니다");
  }
  if (step === "problem" && !/(문제|과제|이슈|어려움|목표)/.test(normalized)) {
    missingPoints.push("해결하려던 문제 정의가 불명확합니다");
  }
  if (step === "action" && !/(실행|개선|도입|협업|시도|분석)/.test(normalized)) {
    missingPoints.push("실제 행동(Action) 설명이 부족합니다");
  }
  if (step === "result" && !hasNumber && !/(성과|증가|감소|향상|개선|달성)/.test(normalized)) {
    missingPoints.push("성과를 보여주는 수치/근거가 부족합니다");
  }

  const score = Math.max(45, 100 - missingPoints.length * 17);
  const isSufficient = missingPoints.length === 0 || (missingPoints.length === 1 && normalized.length >= 35);
  return { score, isSufficient, missingPoints };
};

const buildFollowUpQuestion = (step: StepKey, missingPoints: string[], askedQuestions: Set<string>) => {
  const candidates: string[] = [];
  if (missingPoints.some((item) => item.includes("수치"))) {
    candidates.push(
      "성과를 숫자로 표현해 주실 수 있나요? (예: 처리시간 30% 단축, 매출 15% 증가)",
      "정량 근거를 한 가지 이상 제시해 주세요. (%, 시간, 비용, 건수 등)",
    );
  }
  if (missingPoints.some((item) => item.includes("역할"))) {
    candidates.push(
      "해당 경험에서 본인이 직접 맡았던 책임과 기여를 한 문장으로 먼저 말해 주세요.",
      "팀 내 본인 기여도를 역할 중심으로 구체적으로 말해 주세요.",
    );
  }
  if (missingPoints.some((item) => item.includes("기간"))) {
    candidates.push(
      "해당 경험의 기간을 년/월 또는 주 단위로 구체적으로 알려주세요.",
      "언제 시작해서 언제 끝났는지 기간을 정확히 알려주세요.",
    );
  }
  candidates.push(...(MOCK_FOLLOW_UPS[step] || []), "조금 더 구체적으로 말씀해 주실 수 있나요?");
  const unasked = candidates.find((q) => !askedQuestions.has(q));
  return unasked ?? `${STEP_LABELS[step]} 관련 근거를 하나 더 보강해 주세요.`;
};

const clampScore = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function InterviewPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem("buildme.sessionId"));
  const [experienceId, setExperienceId] = useState<string | null>(() => localStorage.getItem("buildme.experienceId"));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [stepAnswers, setStepAnswers] = useState<Record<StepKey, string>>(() => initStepRecord(""));
  const [followUpCountByStep, setFollowUpCountByStep] = useState<Record<StepKey, number>>(() => initStepRecord(0));
  const [stepEvaluations, setStepEvaluations] = useState<Record<StepKey, StepEvaluation>>(() =>
    initStepRecord({ score: 50, isSufficient: false, missingPoints: ["답변이 입력되지 않았습니다"] }),
  );
  const askedQuestionsRef = useRef<Set<string>>(new Set());
  const currentProgress = useMemo(() => progress, [progress]);

  const currentStepKey = STEP_KEYS[currentStepIndex];
  const isStepComplete = currentStepIndex >= STEP_KEYS.length;

  const startInterview = async () => {
    if (!experienceText.trim()) return;
    if (authLoading) return;
    if (!user) {
      setStartError("로그인 상태가 아니어서 경험관리에 저장할 수 없습니다. 로그인 후 다시 시도해 주세요.");
      return;
    }
    setStartError(null);
    setCompleteError(null);
    setIsStarting(true);
    try {
      const trimmed = experienceText.trim();
      const fallbackTitle = trimmed.split("\n")[0].slice(0, 60) || "AI 인터뷰 경험";

      // 인터뷰 시작 시 경험 관리에도 자동 등록
      try {
        const expRes = await apiFetch<{ experience: { id: string } }>("/experiences", {
          method: "POST",
          body: JSON.stringify({
            title: fallbackTitle,
            sourceType: "text",
            sourceText: trimmed,
          }),
        });
        if (expRes?.experience?.id) {
          setExperienceId(expRes.experience.id);
          localStorage.setItem("buildme.experienceId", expRes.experience.id);
        } else {
          throw new Error("경험 ID를 받지 못했습니다.");
        }
      } catch (e: any) {
        const reason = typeof e?.message === "string" && e.message.trim() ? e.message.trim() : "원인 미확인";
        setStartError(`경험 초안 저장 실패: ${reason}`);
        setIsStarting(false);
        return;
      }

      // 백엔드 없이 프론트엔드 시뮬레이션으로 전환
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const mockSessionId = "local-" + Date.now();
      setSessionId(mockSessionId);
      localStorage.setItem("buildme.sessionId", mockSessionId);
      setProgress(0);
      setCurrentQuestion(STEP_LABELS.company);
      setCurrentStepIndex(0);
      setStepAnswers(initStepRecord(""));
      setFollowUpCountByStep(initStepRecord(0));
      setStepEvaluations(
        initStepRecord({ score: 50, isSufficient: false, missingPoints: ["답변이 입력되지 않았습니다"] }),
      );
      askedQuestionsRef.current.clear();
      const firstQuestion = STEP_LABELS.company;
      askedQuestionsRef.current.add(firstQuestion);
      setMessages([{ role: "ai", text: `반갑습니다. 입력해주신 경험을 바탕으로 인터뷰를 진행하겠습니다.\n\n먼저, ${firstQuestion}` }]);
    } catch (e: any) {
      console.error("Interview start error:", e);
      setStartError("인터뷰 시작 중 오류가 발생했습니다.");
    } finally {
      setIsStarting(false);
    }
  };

  const processMockResponse = async (userText: string) => {
    setIsSending(true);
    setStartError(null);
    
    // 프론트엔드 내 AI 시뮬레이션 응답
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const currentKey = STEP_KEYS[currentStepIndex];
    const mergedAnswer = `${stepAnswers[currentKey] ? `${stepAnswers[currentKey]} ` : ""}${userText}`.trim();
    const evaluation = evaluateAnswer(currentKey, mergedAnswer);
    const stepFollowUpCount = followUpCountByStep[currentKey];
    let nextMessage = "";
    let nextStepIndex = currentStepIndex;
    let isDone = false;

    setStepAnswers((prev) => ({ ...prev, [currentKey]: mergedAnswer }));
    setStepEvaluations((prev) => ({ ...prev, [currentKey]: evaluation }));

    // 답변이 부족하면 역질문으로 보완 유도 (최대 2회)
    if (!evaluation.isSufficient && stepFollowUpCount < 2) {
      nextMessage = buildFollowUpQuestion(currentKey, evaluation.missingPoints, askedQuestionsRef.current);
      setFollowUpCountByStep((prev) => ({ ...prev, [currentKey]: prev[currentKey] + 1 }));
    } else {
      // 충분하거나 역질문 한도 도달 시 다음 단계로 이동
      nextStepIndex = currentStepIndex + 1;
      
      if (nextStepIndex >= STEP_KEYS.length) {
        isDone = true;
        nextMessage = "모든 인터뷰 질문이 완료되었습니다. 답변을 분석해 결과 화면으로 이동합니다.";
      } else {
        const nextKey = STEP_KEYS[nextStepIndex];
        const primaryQuestion = STEP_LABELS[nextKey as keyof typeof STEP_LABELS];
        const nextQuestion =
          !askedQuestionsRef.current.has(primaryQuestion)
            ? primaryQuestion
            : STEP_ALT_QUESTIONS[nextKey].find((q) => !askedQuestionsRef.current.has(q)) ?? primaryQuestion;
        nextMessage = `감사합니다. 다음으로, ${nextQuestion}`;
      }
    }

    // AI가 이미 던진 질문은 재사용하지 않도록 추적
    askedQuestionsRef.current.add(nextMessage.replace("감사합니다. 다음으로, ", "").trim());

    setMessages((prev) => [...prev, { role: "ai", text: nextMessage }]);

    if (isDone) {
      setProgress(100);
      setIsSending(false);
      const finalAnswers = { ...stepAnswers, [currentKey]: mergedAnswer };
      const finalEvaluations = { ...stepEvaluations, [currentKey]: evaluation };
      handleFinish(finalAnswers, finalEvaluations);
      return;
    } else if (nextStepIndex !== currentStepIndex) {
      setCurrentStepIndex(nextStepIndex);
      setCurrentQuestion(STEP_LABELS[STEP_KEYS[nextStepIndex]]);
      setProgress(Math.round(((nextStepIndex) / STEP_KEYS.length) * 100));
    }

    setIsSending(false);
  };

  const sendChatMessage = async () => {
    if (!sessionId || !input.trim()) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    await processMockResponse(text);
  };

  const buildInterviewResult = (
    answers: Record<StepKey, string>,
    evaluations: Record<StepKey, StepEvaluation>,
  ): InterviewResultPayload => {
    const summary = [
      `S(상황): ${answers.company || "상황 설명 없음"}`,
      `T(과제): ${answers.problem || "과제 설명 없음"}`,
      `A(행동): ${answers.action || "행동 설명 없음"}`,
      `R(결과): ${answers.result || "결과 설명 없음"}`,
    ].join("\n");

    const avgScore = Math.round(
      STEP_KEYS.reduce((acc, key) => acc + (evaluations[key]?.score ?? 50), 0) / STEP_KEYS.length,
    );
    const level: "상" | "중" | "하" = avgScore >= 85 ? "상" : avgScore >= 70 ? "중" : "하";

    const strongSteps = STEP_KEYS.filter((key) => (evaluations[key]?.score ?? 0) >= 85).slice(0, 2);
    const weakSteps = STEP_KEYS.filter((key) => (evaluations[key]?.score ?? 100) < 80);

    const feedback: string[] = [
      strongSteps.length > 0
        ? `강점: ${strongSteps.map((key) => STEP_LABELS[key]).join(", ")} 항목이 구체적이고 설득력 있게 전달되었습니다.`
        : "강점: 인터뷰 전반에서 핵심 경험을 구조적으로 전달하려는 흐름이 좋았습니다.",
      /(증가|감소|향상|개선|달성|\d)/.test(answers.result)
        ? "강점: 결과를 근거(수치/성과) 중심으로 설명해 신뢰도를 높였습니다."
        : "개선점: 결과는 가능한 한 수치(%, 시간, 비용 등)로 표현하면 설득력이 크게 올라갑니다.",
      ...weakSteps.slice(0, 2).map((key) => {
        const firstMissing = evaluations[key]?.missingPoints[0] || "핵심 정보 보완이 필요합니다";
        return `개선점: ${STEP_LABELS[key]} 답변에서 "${firstMissing}" 부분을 보완해 보세요.`;
      }),
    ];

    const questions = Array.from(
      new Set(
        weakSteps.flatMap((key) => RECOMMENDED_QUESTIONS_BY_STEP[key]).concat(
          "이 경험을 통해 본인이 얻은 가장 큰 학습은 무엇인가요?",
        ),
      ),
    ).slice(0, 4);

    // "AI 기준형" 세부분석 점수 계산:
    // - 구체성: 역할/기간/문제/행동 항목의 구체화 수준 평균
    // - 성과 중심: 결과 항목 점수 + 수치 근거 보정
    const specificityBase =
      (evaluations.role.score + evaluations.duration.score + evaluations.problem.score + evaluations.action.score) / 4;
    const impactBase = evaluations.result.score;
    const resultText = answers.result || "";
    const hasStrongMetric = /(\d+%|\d+\s*(명|건|원|만원|억원|배|일|주|월)|증가|감소|향상|개선|절감|달성)/.test(resultText);
    const impactScore = clampScore(impactBase + (hasStrongMetric ? 8 : -6));
    const specificityScore = clampScore(specificityBase);

    return {
      summary,
      feedback,
      score: avgScore,
      level,
      questions,
      specificityScore,
      impactScore,
    };
  };

  const handleFinish = async (
    answers: Record<StepKey, string>,
    evaluations: Record<StepKey, StepEvaluation>,
  ) => {
    if (!sessionId) return;
    setCompleteError(null);
    setIsCompleting(true);

    // Mock completion
    setTimeout(async () => {
      const result = buildInterviewResult(answers, evaluations);
      const summaryText = result.summary.replace(/\n/g, " ").trim();
      const finalTitle = summaryText.slice(0, 60) || "AI 인터뷰 경험";
      const mergedSource = [
        `[원본 입력]\n${experienceText.trim()}`,
        "[인터뷰 핵심 요약]\n" + result.summary,
      ].join("\n\n");

      // 완료 시점에 같은 경험 레코드를 업데이트(없으면 fallback 생성)
      try {
        if (experienceId) {
          await apiFetch<{ experience: { id: string } }>(`/experiences/${experienceId}`, {
            method: "PUT",
            body: JSON.stringify({
              title: finalTitle,
              sourceText: mergedSource,
            }),
          });
        } else {
          const fallbackCreate = await apiFetch<{ experience: { id: string } }>("/experiences", {
            method: "POST",
            body: JSON.stringify({
              title: finalTitle,
              sourceType: "text",
              sourceText: mergedSource,
            }),
          });
          if (fallbackCreate?.experience?.id) {
            setExperienceId(fallbackCreate.experience.id);
            localStorage.setItem("buildme.experienceId", fallbackCreate.experience.id);
          }
        }
      } catch (e: any) {
        const reason = typeof e?.message === "string" && e.message.trim() ? e.message.trim() : "원인 미확인";
        setCompleteError(`경험관리 반영 실패: ${reason}`);
      }

      // 3. Clean up local storage and state
      localStorage.removeItem("buildme.sessionId");
      localStorage.removeItem("buildme.experienceId");
      const mockStructuredId = "local-structured-" + Date.now();
      localStorage.setItem("buildme.structuredId", mockStructuredId);
      localStorage.setItem("buildme.interviewResult", JSON.stringify(result));
      // 서버 구조화 결과가 없더라도 분석 리포트 통계는 즉시 반영
      recordAnalysis(result.score);
      addActivity({
        id: `analysis-local-${Date.now()}`,
        type: "analysis",
        title: "AI 인터뷰 분석 완료",
        createdAt: new Date().toISOString(),
      });
      setSessionId(null);
      setExperienceId(null);
      
      // 4. Navigate to the new result page with data
      navigate("/interview-result", { state: result });
      setIsCompleting(false);
    }, 1500);
  };

  useEffect(() => {
    if (sessionId && messages.length === 0 && !currentQuestion) {
      setCurrentQuestion(STEP_LABELS.company);
    }
  }, [sessionId, messages.length, currentQuestion]);

  if (isCompleting) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-[15px] text-[#6B7280] mt-4">경험을 구조화하고 있습니다...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
            <div className="flex-1">
              <h1 className="text-[24px] font-semibold text-[#1A1A1A]">AI 인터뷰</h1>
            </div>
            <span className="text-[14px] text-[#6B7280]">
              {sessionId ? `${Math.min(currentStepIndex + 1, STEP_KEYS.length)}/${STEP_KEYS.length} 단계` : ""} {currentProgress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0052FF] transition-all duration-500"
              style={{ width: `${sessionId ? (100 * (currentStepIndex + 1)) / STEP_KEYS.length : 0}%` }}
            />
          </div>
        </div>

        {!sessionId && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-2">경험 입력</h2>
            <p className="text-[13px] text-[#6B7280] mb-4">
              추상적으로 적어도 됩니다. AI가 역질문으로 구체화를 돕습니다.
            </p>
            <textarea
              value={experienceText}
              onChange={(e) => setExperienceText(e.target.value)}
              placeholder="예) 카페 아르바이트에서 재고 관리 프로세스를 개선해 폐기율을 줄였습니다."
              className="w-full min-h-[120px] bg-white border border-[#D1D5DB] rounded-lg px-4 py-3 text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent resize-none"
            />
            {startError && (
              <p className="mt-4 text-[13px] text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{startError}</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                disabled={isStarting || authLoading || !user || !experienceText.trim()}
                onClick={startInterview}
                className="bg-[#0052FF] disabled:bg-[#9CB7FF] disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium text-[15px] transition-colors"
              >
                {isStarting ? "시작 중..." : "AI 인터뷰 시작"}
              </button>
            </div>
            {!authLoading && !user && (
              <p className="mt-3 text-[13px] text-[#6B7280]">
                경험관리 저장을 위해 로그인 후 이용해 주세요.{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-[#0052FF] underline"
                >
                  로그인하러 가기
                </button>
              </p>
            )}
          </div>
        )}

        {completeError && (
          <p className="mb-4 text-[13px] text-[#DC2626] bg-[#FEF2F2] rounded-lg px-3 py-2">{completeError}</p>
        )}

        {sessionId && !isStepComplete && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-4">
            <p className="text-[13px] text-[#0052FF] font-medium mb-1">
              {currentStepIndex + 1}단계 · {currentStepKey}
            </p>
            <h2 className="text-[18px] font-semibold text-[#1A1A1A]">{currentQuestion}</h2>
          </div>
        )}

        {sessionId && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-[#E5E7EB] bg-[#FAFAFA]">
              <p className="text-[13px] text-[#6B7280]">역질문 · 채팅</p>
            </div>
            <div className="p-4 space-y-3 min-h-[280px] max-h-[400px] overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 bg-[#EEF2FF] rounded-full flex-shrink-0 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#0052FF]" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[85%] text-[14px] ${
                      msg.role === "ai" ? "bg-[#F9FAFB] text-[#1A1A1A]" : "bg-[#0052FF] text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E5E7EB] p-3 bg-[#FAFAFA]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="AI 역질문에 답하세요..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  disabled={isSending || isStepComplete}
                  className="flex-1 bg-white border border-[#D1D5DB] rounded-lg px-4 py-2.5 text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
                <button
                  disabled={isSending || !input.trim() || isStepComplete}
                  onClick={sendChatMessage}
                  className="w-10 h-10 bg-[#0052FF] disabled:bg-[#9CB7FF] rounded-lg flex items-center justify-center"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
