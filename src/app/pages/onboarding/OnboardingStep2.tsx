import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { OnboardingHeader } from "../../components/OnboardingHeader";

const states = [
  { id: "unorganized", label: "경험은 있지만 정리가 안 되어 있어요" },
  { id: "some", label: "프로젝트 경험이 몇 개 있어요" },
  { id: "beginner", label: "거의 처음부터 시작이에요" },
  { id: "junior", label: "경력 1~3년 차입니다" },
  { id: "senior", label: "3년 이상 경력자입니다" },
];

export function OnboardingStep2() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedState) {
      navigate("/onboarding/step3");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OnboardingHeader step={2} onBack={() => navigate("/onboarding/step1")} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-[640px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-[36px] font-semibold text-[#1A1A1A] mb-3">
              현재 당신의<br />
              준비 상태는 어떤가요?
            </h1>
            <p className="text-[16px] text-[#6B7280] mb-8">
              솔직한 선택이 더 정확한 분석을 만듭니다.
            </p>

            {/* State Cards */}
            <div className="grid grid-cols-1 gap-3 mb-8">
              {states.map((state) => (
                <button
                  key={state.id}
                  onClick={() => setSelectedState(state.id)}
                  className={`
                    relative p-5 rounded-lg border-2 text-left transition-all duration-200
                    ${
                      selectedState === state.id
                        ? "border-[#0052FF] bg-[#EEF2FF] shadow-md"
                        : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-sm"
                    }
                  `}
                >
                  <span className="text-[15px] font-medium text-[#1A1A1A]">
                    {state.label}
                  </span>
                  {selectedState === state.id && (
                    <div className="absolute top-5 right-5 w-6 h-6 bg-[#0052FF] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!selectedState}
              className={`
                w-full py-4 rounded-lg font-semibold text-[16px] transition-all
                ${
                  selectedState
                    ? "bg-[#0052FF] hover:bg-[#0047E0] text-white"
                    : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                }
              `}
            >
              다음 단계로
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
