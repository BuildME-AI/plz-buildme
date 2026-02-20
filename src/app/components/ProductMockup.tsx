import { Sparkles, TrendingUp } from "lucide-react";

export function ProductMockup() {
  return (
    <div className="relative">
      {/* Main container with soft shadow */}
      <div className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden border border-[#E8E8E8]">
        <div className="grid grid-cols-2">
          {/* Left panel - AI Interview Chat */}
          <div className="bg-white p-8 border-r border-[#F0F0F0]">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-[14px] text-[#1A1A1A]">AI 인터뷰</span>
            </div>
            
            <div className="space-y-4">
              {/* AI Question */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F3F4F6] flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#4F46E5]"></div>
                </div>
                <div className="bg-[#F7F8FA] rounded-[16px] px-4 py-3 max-w-[280px]">
                  <p className="text-[13px] leading-[1.5] text-[#333333]">
                    그 경험에서 가장 기억에 남는 성과나 개선 사항이 있나요?
                  </p>
                </div>
              </div>
              
              {/* User Response */}
              <div className="flex gap-3 justify-end">
                <div className="bg-[#4F46E5] rounded-[16px] px-4 py-3 max-w-[280px]">
                  <p className="text-[13px] leading-[1.5] text-white">
                    재고 관리를 체계화해서 음식물 폐기가 많이 줄었어요
                  </p>
                </div>
              </div>
              
              {/* AI Follow-up */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F3F4F6] flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#4F46E5]"></div>
                </div>
                <div className="bg-[#F7F8FA] rounded-[16px] px-4 py-3 max-w-[280px]">
                  <p className="text-[13px] leading-[1.5] text-[#333333]">
                    대략 어느 정도 비율로 줄었나요?
                  </p>
                </div>
              </div>
              
              {/* Typing indicator */}
              <div className="flex gap-3 justify-end">
                <div className="bg-[#EEF2FF] rounded-[16px] px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right panel - Performance Analysis */}
          <div className="bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-[14px] text-[#1A1A1A]">성과 분석</span>
            </div>
            
            {/* Score display */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E8E8E8] mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[36px] font-bold text-[#4F46E5]">85</span>
                <span className="text-[16px] text-[#999999]">/100</span>
              </div>
              <p className="text-[13px] text-[#666666]">성과 구체성 점수</p>
            </div>
            
            {/* Feedback highlights */}
            <div className="space-y-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-[12px] px-4 py-3 border border-[#E8E8E8]">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 flex-shrink-0"></div>
                  <p className="text-[12px] leading-[1.5] text-[#333333]">
                    <span className="font-medium text-[#10B981]">정량적 지표 발견:</span> 폐기율 15% 감소
                  </p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-[12px] px-4 py-3 border border-[#E8E8E8]">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0"></div>
                  <p className="text-[12px] leading-[1.5] text-[#333333]">
                    <span className="font-medium text-[#F59E0B]">검증 필요:</span> 구체적인 기간 명시 권장
                  </p>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-[12px] px-4 py-3 border border-[#E8E8E8]">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 flex-shrink-0"></div>
                  <p className="text-[12px] leading-[1.5] text-[#333333]">
                    <span className="font-medium text-[#10B981]">STAR 구조 적용 가능</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#4F46E5]/5 to-[#7C3AED]/5 rounded-[32px] -z-10 blur-2xl"></div>
    </div>
  );
}
