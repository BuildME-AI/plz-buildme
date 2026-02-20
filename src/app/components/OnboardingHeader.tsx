import { useNavigate } from "react-router";
import { ArrowLeft, Home } from "lucide-react";

type OnboardingHeaderProps = {
  step: number;
  totalSteps?: number;
  onBack?: () => void;
};

export function OnboardingHeader({ step, totalSteps = 7, onBack }: OnboardingHeaderProps) {
  const navigate = useNavigate();
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="border-b border-[#E5E7EB]">
      <div className="max-w-[640px] mx-auto px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 min-w-0">
            {onBack != null ? (
              <button
                onClick={onBack}
                className="p-2.5 hover:bg-[#F9FAFB] rounded-lg transition-colors text-[#6B7280] hover:text-[#1A1A1A] flex-shrink-0"
                aria-label="뒤로 가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-[42px] flex-shrink-0" />
            )}
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[14px] font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1A1A1A] transition-colors flex-shrink-0"
          >
            <Home className="w-4 h-4" />
            <span>홈</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[13px] font-medium text-[#0052FF]">{step}/{totalSteps} 단계</span>
        </div>
        <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0052FF] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
