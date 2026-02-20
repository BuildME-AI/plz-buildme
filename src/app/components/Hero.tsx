import { ArrowRight, Play } from "lucide-react";
import { ProductMockup } from "./ProductMockup";

export function Hero() {
  return (
    <section className="min-h-screen max-w-[1440px] mx-auto px-16 flex items-center">
      <div className="w-full grid grid-cols-12 gap-12 items-center">
        {/* Left side - Content */}
        <div className="col-span-5 space-y-8">
          <h1 className="text-[64px] leading-[1.2] tracking-tight text-[#1A1A1A]">
            흩어진 경험을<br />
            설득력 있는 결과로.
          </h1>
          
          <p className="text-[20px] leading-[1.6] text-[#555555]">
            AI가 당신의 경험을 인터뷰하고<br />
            성과 중심 포트폴리오로 완성합니다.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <button className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-4 rounded-[16px] font-medium text-[16px] transition-all duration-200 shadow-[0_8px_24px_rgba(79,70,229,0.2)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.3)] hover:-translate-y-0.5">
              무료로 시작하기
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1A1A1A] px-8 py-4 rounded-[16px] font-medium text-[16px] transition-all duration-200 border border-[#E3E3E3] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <Play className="w-5 h-5" />
              데모 보기
            </button>
          </div>
        </div>
        
        {/* Right side - Product Mockup */}
        <div className="col-span-7">
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}
