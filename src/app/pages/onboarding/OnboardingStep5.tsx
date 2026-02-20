import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { OnboardingHeader } from "../../components/OnboardingHeader";

const analysisSteps = [
  "경험 요소 추출 중…",
  "성과 지표 구조화 중…",
  "직무 적합도 계산 중…",
];

export function OnboardingStep5() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    const navigationTimer = setTimeout(() => {
      navigate("/dashboard");
    }, 3500);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OnboardingHeader step={5} onBack={() => navigate("/onboarding/step4")} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-[480px] w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Spinner */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#E5E7EB] border-t-[#0052FF] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Main Message */}
            <h1 className="text-[32px] font-semibold text-[#1A1A1A] mb-3">
              당신의 경험을<br />
              분석하고 있습니다…
            </h1>

            {/* Analysis Steps */}
            <div className="space-y-3 mt-8">
              {analysisSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= currentStep ? 1 : 0.3,
                    x: 0,
                  }}
                  transition={{ delay: index * 0.3 }}
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
