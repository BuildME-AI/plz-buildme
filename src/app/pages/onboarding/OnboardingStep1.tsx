import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { FileText, Shield, Edit3, Home } from "lucide-react";
import { useAuth } from "../../../lib/auth";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../../lib/onboardingStore";

export function OnboardingStep1() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/onboarding/step1");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    void loadOnboardingDraft();
  }, [user]);

  const handleStart = async () => {
    await saveOnboardingDraft({ completedStep: 1 });
    navigate("/onboarding/step2");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-[#E5E7EB]">
        <div className="max-w-[640px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
            >
              <img src="/buildme-logo.png" alt="BuildMe" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <span className="text-[20px] font-semibold text-[#1A1A1A] truncate">BuildMe</span>
            </button>
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

      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-[640px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-[#0052FF]" />
            </div>

            <h1 className="text-[36px] font-semibold text-[#1A1A1A] mb-3 text-center">
              당신의 경험을 바탕으로
              <br />
              포트폴리오를 만들어드립니다
            </h1>
            <p className="text-[16px] text-[#6B7280] mb-10 text-center leading-[1.6]">
              지금부터 입력하는 정보는 포트폴리오의 완성도를 높이기 위해 사용됩니다.
              <br />
              정리되지 않은 상태여도 괜찮습니다. 함께 정리해나가겠습니다.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-[#F9FAFB] rounded-lg p-5 flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#1A1A1A] mb-1">안전한 정보 관리</p>
                  <p className="text-[13px] text-[#6B7280] leading-[1.5]">
                    입력하신 정보는 포트폴리오 제작 목적으로만 사용됩니다
                  </p>
                </div>
              </div>
              <div className="bg-[#F9FAFB] rounded-lg p-5 flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Edit3 className="w-4 h-4 text-[#0052FF]" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#1A1A1A] mb-1">언제든 수정 가능</p>
                  <p className="text-[13px] text-[#6B7280] leading-[1.5]">
                    입력한 내용은 언제든지 수정하고 보완할 수 있습니다
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-[#0052FF] hover:bg-[#0047E0] text-white py-4 rounded-lg font-semibold text-[16px] transition-all"
            >
              포트폴리오 만들기 시작
            </button>
            <p className="text-[13px] text-[#9CA3AF] text-center mt-3">약 3분 정도 소요됩니다</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
