import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../../../lib/auth";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../../lib/onboardingStore";

export function OnboardingStep5() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [achievement, setAchievement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/onboarding/step5");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    void loadOnboardingDraft().then((draft) => {
      setAchievement(draft.payload.achievement);
    });
  }, [user]);

  const handleNext = async () => {
    if (submitting) return;
    setSubmitting(true);
    await saveOnboardingDraft({
      payloadPatch: { achievement: achievement.trim() },
      completedStep: 5,
    });
    navigate("/onboarding/step6");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-[#E5E7EB]">
        <div className="max-w-[640px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/onboarding/step4")}
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
            <span className="text-[13px] font-medium text-[#0052FF]">4/6 단계</span>
          </div>
          <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full bg-[#0052FF] w-[66.66%] transition-all duration-500" />
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
              가장 자신 있는
              <br />
              성과나 프로젝트가 있나요?
            </h1>
            <p className="text-[16px] text-[#6B7280] mb-8">
              포트폴리오에서 가장 강조하고 싶은 내용을 적어주세요.
              <br />
              숫자 성과가 없어도 괜찮습니다.
            </p>

            <div className="mb-4">
              <textarea
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                placeholder={`예시:\n\n• SNS 콘텐츠 전략 변경으로 팔로워 수 3개월간 40% 증가\n\n• 고객 불만 접수 프로세스를 개선해 응답 시간 평균 2일 단축\n\n• 서비스 UX 개선 프로젝트를 주도하여 사용자 이탈률 감소\n\n• 신규 마케팅 채널 발굴 후 월 매출 20% 증가 기여`}
                className="w-full min-h-[280px] bg-white border border-[#D1D5DB] rounded-lg px-4 py-4 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all resize-none leading-[1.6]"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[13px] text-[#6B7280]">문제 해결 과정이나 본인의 역할 중심으로 작성해도 좋습니다</p>
                <span className={`text-[13px] ${achievement.length > 0 ? "text-[#10B981]" : "text-[#9CA3AF]"}`}>
                  {achievement.length}자
                </span>
              </div>
            </div>

            <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-4 mb-8">
              <p className="text-[13px] text-[#92400E] leading-[1.5]">
                <span className="font-medium">선택 사항입니다.</span> 성과나 프로젝트 내용이 없다면 건너뛰어도 됩니다.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleNext}
                disabled={submitting}
                className="flex-1 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#6B7280] py-4 rounded-lg font-semibold text-[16px] transition-all"
              >
                건너뛰기
              </button>
              <button
                onClick={handleNext}
                disabled={submitting}
                className="flex-1 bg-[#0052FF] hover:bg-[#0047E0] text-white py-4 rounded-lg font-semibold text-[16px] transition-all"
              >
                다음 단계로
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
