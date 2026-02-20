import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { addActivity } from "../../../lib/dashboardState";
import { OnboardingHeader } from "../../components/OnboardingHeader";

export function OnboardingStep4() {
  const navigate = useNavigate();
  const [experience, setExperience] = useState("");

  const handleNext = () => {
    if (experience.trim().length > 20) {
      addActivity({
        id: `onboarding-${Date.now()}`,
        type: "onboarding",
        title: experience.slice(0, 40),
        createdAt: new Date().toISOString(),
      });
      navigate("/onboarding/step5", { state: { experienceText: experience } });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OnboardingHeader step={4} onBack={() => navigate("/onboarding/step3")} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-[640px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-[36px] font-semibold text-[#1A1A1A] mb-3">
              가장 기억에 남는<br />
              경험 하나를 이야기해주세요.
            </h1>
            <p className="text-[16px] text-[#6B7280] mb-8">
              완벽하게 정리되어 있지 않아도 괜찮습니다.<br />
              AI가 구조화해드립니다.
            </p>

            {/* Experience Input */}
            <div className="mb-4">
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder={`예:\n동아리에서 3개월 동안 팀 프로젝트를 진행했고,\n사용자 조사를 통해 방향을 수정했습니다…`}
                className="w-full min-h-[280px] bg-white border border-[#D1D5DB] rounded-lg px-4 py-4 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[13px] text-[#6B7280]">
                  💡 입력한 내용은 자동으로 성과 구조로 분석됩니다.
                </p>
                <span className={`text-[13px] ${experience.length > 20 ? "text-[#10B981]" : "text-[#9CA3AF]"}`}>
                  {experience.length}자
                </span>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={experience.trim().length < 20}
              className={`
                w-full py-4 rounded-lg font-semibold text-[16px] transition-all
                ${
                  experience.trim().length >= 20
                    ? "bg-[#0052FF] hover:bg-[#0047E0] text-white"
                    : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                }
              `}
            >
              분석 시작하기
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
