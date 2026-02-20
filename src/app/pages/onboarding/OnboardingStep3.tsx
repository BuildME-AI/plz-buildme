import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { OnboardingHeader } from "../../components/OnboardingHeader";

const popularJobs = [
  "프로덕트 매니저",
  "콘텐츠 마케터",
  "프론트엔드 개발자",
  "데이터 분석가",
  "UX 디자이너",
  "백엔드 개발자",
];

export function OnboardingStep3() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const handleSelectJob = (job: string) => {
    if (!selectedJobs.includes(job)) {
      setSelectedJobs([...selectedJobs, job]);
      setSearchTerm("");
    }
  };

  const handleRemoveJob = (job: string) => {
    setSelectedJobs(selectedJobs.filter((j) => j !== job));
  };

  const canGoNext = selectedJobs.length > 0 || searchTerm.trim().length > 0;

  const handleNext = () => {
    if (!canGoNext) return;
    const custom = searchTerm.trim();
    if (custom && !selectedJobs.includes(custom)) {
      setSelectedJobs([...selectedJobs, custom]);
    }
    navigate("/onboarding/step4");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OnboardingHeader step={3} onBack={() => navigate("/onboarding/step2")} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-[640px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-[36px] font-semibold text-[#1A1A1A] mb-3">
              준비 중인 직무를<br />
              선택해주세요
            </h1>
            <p className="text-[16px] text-[#6B7280] mb-8">
              직무에 맞춰 성과 구조를 다르게 분석합니다.
            </p>

            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="예: PM, 마케팅, 프론트엔드, 데이터 분석"
                className="w-full bg-white border border-[#D1D5DB] rounded-lg px-4 py-3.5 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
              />
            </div>

            {/* Selected Jobs */}
            {selectedJobs.length > 0 && (
              <div className="mb-6">
                <p className="text-[14px] text-[#6B7280] mb-3">선택한 직무</p>
                <div className="flex flex-wrap gap-2">
                  {selectedJobs.map((job) => (
                    <div
                      key={job}
                      className="bg-[#EEF2FF] border border-[#0052FF] text-[#0052FF] px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span className="text-[14px] font-medium">{job}</span>
                      <button
                        onClick={() => handleRemoveJob(job)}
                        className="hover:bg-[#0052FF] hover:text-white rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Jobs */}
            <div className="mb-8">
              <p className="text-[14px] text-[#6B7280] mb-3">인기 직무</p>
              <div className="flex flex-wrap gap-2">
                {popularJobs.map((job) => (
                  <button
                    key={job}
                    onClick={() => handleSelectJob(job)}
                    disabled={selectedJobs.includes(job)}
                    className={`
                      px-4 py-2 rounded-lg text-[14px] font-medium transition-all
                      ${
                        selectedJobs.includes(job)
                          ? "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
                          : "bg-white border border-[#E5E7EB] text-[#1A1A1A] hover:border-[#0052FF] hover:bg-[#EEF2FF]"
                      }
                    `}
                  >
                    {job}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`
                w-full py-4 rounded-lg font-semibold text-[16px] transition-all
                ${
                  canGoNext
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
