import { ArrowRight } from "lucide-react";

export function Transformation() {
  return (
    <section className="max-w-[1440px] mx-auto px-16 py-32">
      <div className="text-center mb-16">
        <h2 className="text-[48px] font-bold text-[#1A1A1A] leading-[1.3] tracking-tight">
          단순한 경험을, 결과로 바꿉니다
        </h2>
      </div>
      
      <div className="grid grid-cols-12 gap-8 items-center">
        {/* Before Card */}
        <div className="col-span-5">
          <div className="bg-white rounded-[24px] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-[#E8E8E8] relative overflow-hidden min-h-[280px] flex items-center">
            {/* Subtle pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F3F4F6] to-transparent rounded-full -mr-16 -mt-16 opacity-50"></div>
            
            <div className="relative z-10">
              <div className="inline-block bg-[#F3F4F6] text-[#666666] text-[12px] font-medium px-3 py-1.5 rounded-full mb-6">
                Before
              </div>
              <p className="text-[28px] leading-[1.5] text-[#666666] font-normal">
                "카페 알바<br />열심히 했습니다."
              </p>
            </div>
          </div>
        </div>
        
        {/* Arrow */}
        <div className="col-span-2 flex justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center shadow-[0_8px_24px_rgba(79,70,229,0.2)]">
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* After Card */}
        <div className="col-span-5">
          <div className="bg-gradient-to-br from-white to-[#F9FAFB] rounded-[24px] p-10 shadow-[0_16px_48px_rgba(79,70,229,0.12)] border-2 border-[#4F46E5]/20 relative overflow-hidden min-h-[280px] flex items-center">
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-br from-[#4F46E5]/10 to-[#7C3AED]/10 rounded-[28px] -z-10 blur-xl"></div>
            
            {/* Accent pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#4F46E5]/10 to-transparent rounded-full -mr-20 -mt-20"></div>
            
            <div className="relative z-10">
              <div className="inline-block bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-[12px] font-medium px-3 py-1.5 rounded-full mb-6">
                After
              </div>
              <p className="text-[24px] leading-[1.6] text-[#1A1A1A] font-medium">
                "선입선출 기반 재고 프로세스 개선을 통해<br />
                <span className="text-[#4F46E5] font-semibold">폐기율 15% 감소</span>{" "}
                <span className="text-[16px] text-[#999999] font-normal">(사용자 확인 필요)</span>"
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle description */}
      <div className="text-center mt-12">
        <p className="text-[16px] text-[#999999]">
          AI가 질문하고, 구조화하고, 검증합니다
        </p>
      </div>
    </section>
  );
}
