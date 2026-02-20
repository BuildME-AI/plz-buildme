import { MessageCircle, Target, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "AI 역질문 인터뷰",
    description: "경험을 깊이 있게 구조화",
    gradient: "from-[#4F46E5] to-[#6366F1]",
  },
  {
    icon: Target,
    title: "성과 중심 자동 정리",
    description: "STAR 기반 변환 및 추상 표현 제거",
    gradient: "from-[#10B981] to-[#059669]",
  },
  {
    icon: Sparkles,
    title: "직무 맞춤 재구성",
    description: "기업/직무별 자동 최적화",
    gradient: "from-[#7C3AED] to-[#A855F7]",
  },
];

export function Features() {
  return (
    <section className="max-w-[1440px] mx-auto px-16 py-32 bg-white/50">
      <div className="space-y-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-[24px] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-[#E8E8E8] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] hover:border-[#D1D5DB] transition-all duration-300 group"
            >
              <div className="flex items-center gap-8">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-[20px] bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-[0_8px_24px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-[28px] font-bold text-[#1A1A1A] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[18px] text-[#666666] leading-[1.6]">
                    {feature.description}
                  </p>
                </div>
                
                {/* Decorative arrow */}
                <div className="w-10 h-10 rounded-full bg-[#F7F8FA] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
