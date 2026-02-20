import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { OnboardingHeader } from "../../components/OnboardingHeader";
import { useAuth } from "../../../lib/auth";

const goals = [
  { id: "newbie", label: "신입 취업 준비" },
  { id: "career", label: "이직 준비" },
  { id: "portfolio", label: "포트폴리오 개선" },
  { id: "resume", label: "자기소개서 작성" },
  { id: "interview", label: "면접 대비" },
];

export function OnboardingStep1() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  const handleNext = () => {
    if (selectedGoal) {
      navigate("/onboarding/step2");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OnboardingHeader step={1} onBack={() => navigate("/")} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-[640px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-[36px] font-semibold text-[#1A1A1A] mb-3">
              BuildMe를 통해<br />
              무엇을 준비하고 있나요?
            </h1>
            <p className="text-[16px] text-[#6B7280] mb-8">
              목표에 따라 분석 방식이 달라집니다.
            </p>

            {/* Goal Cards */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`
                    relative p-6 rounded-lg border-2 text-left transition-all duration-200
                    ${
                      selectedGoal === goal.id
                        ? "border-[#0052FF] bg-[#EEF2FF] shadow-md"
                        : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-sm"
                    }
                  `}
                >
                  <span className="text-[16px] font-medium text-[#1A1A1A]">
                    {goal.label}
                  </span>
                  {selectedGoal === goal.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-[#0052FF] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!selectedGoal}
              className={`
                w-full py-4 rounded-lg font-semibold text-[16px] transition-all
                ${
                  selectedGoal
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
