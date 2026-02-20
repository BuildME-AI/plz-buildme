import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="max-w-[1440px] mx-auto px-16 py-32">
      <div className="relative">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/5 via-[#7C3AED]/5 to-[#EC4899]/5 rounded-[32px] -z-10"></div>
        
        {/* Content card */}
        <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-[32px] p-20 text-center relative overflow-hidden shadow-[0_24px_64px_rgba(79,70,229,0.2)]">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-[52px] font-bold text-white leading-[1.3] tracking-tight mb-6">
              이제 당신의 경험을<br />
              결과로 바꿔보세요.
            </h2>
            
            <p className="text-[18px] text-white/80 mb-10 leading-[1.6]">
              5분이면 충분합니다. 지금 시작하세요.
            </p>
            
            <button className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-[#4F46E5] px-10 py-5 rounded-[16px] font-semibold text-[18px] transition-all duration-200 shadow-[0_12px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1">
              지금 시작하기
              <ArrowRight className="w-6 h-6" />
            </button>
            
            <p className="text-[14px] text-white/60 mt-6">
              신용카드 없이 무료로 시작 · 언제든 취소 가능
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
