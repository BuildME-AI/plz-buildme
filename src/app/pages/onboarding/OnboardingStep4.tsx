import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Home } from "lucide-react";
import { addActivity } from "../../../lib/dashboardState";
import { useAuth } from "../../../lib/auth";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../../lib/onboardingStore";

export function OnboardingStep4() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [experience, setExperience] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/onboarding/step4");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    void loadOnboardingDraft().then((draft) => {
      setExperience(draft.payload.experience);
    });
  }, [user]);

  const handleNext = async () => {
    const value = experience.trim();
    if (value.length < 10 || submitting) return;
    setSubmitting(true);

    await saveOnboardingDraft({
      payloadPatch: { experience: value },
      completedStep: 4,
    });

    addActivity({
      id: `onboarding-${Date.now()}`,
      type: "onboarding",
      title: value.slice(0, 40),
      createdAt: new Date().toISOString(),
    });

    navigate("/onboarding/step5");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-[#E5E7EB]">
        <div className="max-w-[640px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/onboarding/step3")}
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
            <span className="text-[13px] font-medium text-[#0052FF]">3/6 단계</span>
          </div>
          <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full bg-[#0052FF] w-[50%] transition-all duration-500" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-[640px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-[36px] font-semibold text-[#1A1A1A] mb-3">
              지금까지의 경험을
              <br />
              편하게 적어주세요
            </h1>
            <p className="text-[16px] text-[#6B7280] mb-8">
              회사명, 근무 기간, 담당 역할 정도만 적어도 충분합니다.
              <br />
              정리되지 않은 상태여도 괜찮습니다.
            </p>

            <div className="mb-4">
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder={`예시:\n\n• (주)테크컴퍼니 / 2022.03 ~ 2024.02 / 마케팅팀\n  - SNS 콘텐츠 기획 및 운영\n  - 광고 캠페인 성과 분석\n\n• 00대학교 창업동아리 / 2021.09 ~ 2022.02 / 기획팀장\n  - 서비스 기획 및 사용자 리서치 진행`}
                className="w-full min-h-[300px] bg-white border border-[#D1D5DB] rounded-lg px-4 py-4 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all resize-none leading-[1.6]"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[13px] text-[#6B7280]">이 정보를 바탕으로 포트폴리오 구조가 만들어집니다</p>
                <span className={`text-[13px] ${experience.length > 10 ? "text-[#10B981]" : "text-[#9CA3AF]"}`}>
                  {experience.length}자
                </span>
              </div>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 mb-8">
              <p className="text-[13px] text-[#6B7280] leading-[1.5]">
                <span className="font-medium text-[#1A1A1A]">Tip:</span> 아르바이트, 동아리, 프로젝트, 인턴 등 모든 경험이 포함될 수 있습니다. 완벽하게 작성하지 않아도 괜찮습니다.
              </p>
            </div>

            <button
              onClick={handleNext}
              disabled={experience.trim().length < 10 || submitting}
              className={`
                w-full py-4 rounded-lg font-semibold text-[16px] transition-all
                ${
                  experience.trim().length >= 10 && !submitting
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
