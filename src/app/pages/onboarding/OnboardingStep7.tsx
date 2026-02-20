import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Home } from "lucide-react";
import { addActivity } from "../../../lib/dashboardState";
import { useAuth } from "../../../lib/auth";
import { completeOnboarding, saveOnboardingDraft } from "../../../lib/onboardingStore";

const generationSteps = [
  "프로필 정보 구성 중",
  "경력 정보 구조화 중",
  "성과 분석 및 강조점 추출 중",
  "포트폴리오 레이아웃 설정 중",
];

export function OnboardingStep7() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/onboarding/step7");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    void saveOnboardingDraft({ completedStep: 7 });

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < generationSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    const completeTimer = setTimeout(() => {
      setIsComplete(true);
    }, 3500);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(completeTimer);
    };
  }, [user]);

  const handleViewPortfolio = async () => {
    const draft = await completeOnboarding();
    const title = draft.payload.targetJob
      ? `${draft.payload.targetJob} 포트폴리오 온보딩 완료`
      : "포트폴리오 온보딩 완료";

    addActivity({
      id: `onboarding-complete-${Date.now()}`,
      type: "onboarding",
      title,
      createdAt: new Date().toISOString(),
    });

    navigate("/dashboard");
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="border-b border-[#E5E7EB]">
          <div className="max-w-[640px] mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/onboarding/step6")}
                  className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <img src="/buildme-logo.png" alt="BuildMe" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  <span className="text-[20px] font-semibold text-[#1A1A1A] truncate">BuildMe</span>
                </button>
              </div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[14px] font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1A1A1A] transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>홈</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-[520px] w-full text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-20 h-20 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-[#10B981]" />
              </div>

              <h1 className="text-[36px] font-semibold text-[#1A1A1A] mb-3">
                포트폴리오가
                <br />
                준비되었습니다
              </h1>
              <p className="text-[16px] text-[#6B7280] mb-10 leading-[1.6]">
                입력하신 정보를 바탕으로 포트폴리오를 만들었습니다.
                <br />
                내용을 확인하고 언제든지 수정할 수 있습니다.
              </p>

              <button
                onClick={handleViewPortfolio}
                className="w-full bg-[#0052FF] hover:bg-[#0047E0] text-white py-4 rounded-lg font-semibold text-[16px] transition-all mb-4"
              >
                대시보드로 이동
              </button>

              <div className="bg-[#F9FAFB] rounded-lg p-5 text-left">
                <p className="text-[13px] text-[#6B7280] leading-[1.6]">
                  <span className="font-medium text-[#1A1A1A]">다음 단계:</span>
                  <br />• 포트폴리오 내용을 검토하고 수정하기
                  <br />• PDF 또는 PPT로 내보내기
                  <br />• 직무별 맞춤 버전 생성하기
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-[#E5E7EB]">
        <div className="max-w-[640px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/onboarding/step6")}
                className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
              >
                <img src="/buildme-logo.png" alt="BuildMe" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <span className="text-[20px] font-semibold text-[#1A1A1A] truncate">BuildMe</span>
              </button>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[14px] font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1A1A1A] transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>홈</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] font-medium text-[#0052FF]">6/6 단계</span>
          </div>
          <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full bg-[#0052FF] w-[100%] transition-all duration-500" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-[520px] w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#E5E7EB] border-t-[#0052FF] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-full"></div>
                </div>
              </div>
            </div>

            <h1 className="text-[32px] font-semibold text-[#1A1A1A] mb-3">
              포트폴리오를
              <br />
              만들고 있습니다
            </h1>
            <p className="text-[15px] text-[#6B7280] mb-10">입력하신 정보를 바탕으로 자동 생성이 진행됩니다</p>

            <div className="space-y-3">
              {generationSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= currentStep ? 1 : 0.3,
                    x: 0,
                  }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-center justify-center gap-3"
                >
                  {index < currentStep ? (
                    <div className="w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : index === currentStep ? (
                    <div className="w-5 h-5 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-[#E5E7EB] rounded-full"></div>
                  )}
                  <span
                    className={`text-[15px] ${
                      index <= currentStep ? "text-[#1A1A1A] font-medium" : "text-[#9CA3AF]"
                    }`}
                  >
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

