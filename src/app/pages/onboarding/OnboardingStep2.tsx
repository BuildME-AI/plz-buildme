import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../../../lib/auth";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../../lib/onboardingStore";

export function OnboardingStep2() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login?redirect=/onboarding/step2");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    void loadOnboardingDraft().then((draft) => {
      setName(draft.payload.name);
      setBio(draft.payload.bio);
    });
  }, [user]);

  const handleNext = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    await saveOnboardingDraft({
      payloadPatch: { name: name.trim(), bio: bio.trim() },
      completedStep: 2,
    });
    navigate("/onboarding/step3");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-[#E5E7EB]">
        <div className="max-w-[640px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/onboarding/step1")}
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
            <span className="text-[13px] font-medium text-[#0052FF]">1/6 단계</span>
          </div>
          <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div className="h-full bg-[#0052FF] w-[16.66%] transition-all duration-500" />
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
              기본 정보를
              <br />
              입력해주세요
            </h1>
            <p className="text-[16px] text-[#6B7280] mb-8">포트폴리오 상단에 표시될 프로필 정보입니다.</p>

            <div className="mb-5">
              <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">
                이름 <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full bg-white border border-[#D1D5DB] rounded-lg px-4 py-3.5 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
              />
            </div>

            <div className="mb-8">
              <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">
                한 줄 소개 <span className="text-[#9CA3AF] font-normal">(선택)</span>
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="예: 데이터로 문제를 해결하는 마케터 / 사용자 경험을 디자인하는 기획자"
                className="w-full bg-white border border-[#D1D5DB] rounded-lg px-4 py-3.5 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
              />
              <p className="text-[13px] text-[#6B7280] mt-2">짧게 작성해도 괜찮습니다. 나중에 수정할 수 있습니다.</p>
            </div>

            <button
              onClick={handleNext}
              disabled={!name.trim() || submitting}
              className={`
                w-full py-4 rounded-lg font-semibold text-[16px] transition-all
                ${
                  name.trim() && !submitting
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
