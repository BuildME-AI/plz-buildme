import { useNavigate } from "react-router";
import { ArrowRight, MessageSquare, BarChart3, FileStack, TrendingUp, CheckCircle, Search, ChevronDown, Star } from "lucide-react";
import { motion } from "motion/react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useState } from "react";
import { useAuth } from "../../lib/auth";

export function HomePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleStart = () => {
    if (user) navigate("/onboarding/step1");
    else navigate("/login?redirect=/onboarding/step1");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-8 pt-24 pb-16">
        <div className="max-w-[680px] mb-12">
          <h1 className="text-[56px] leading-[1.15] tracking-tight text-[#1A1A1A] mb-6">
            흩어진 나를 완성하는<br />
            AI 포트폴리오
          </h1>
          <p className="text-[20px] leading-[1.5] text-[#555555] mb-8">
            BuildMe와 함께 당신의 경험 속 숨겨진 가치를 발견하고, 성과 중심의 포트폴리오를 완성하세요.
          </p>

          {/* CTA Section */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={handleStart}
              className="bg-[#0052FF] hover:bg-[#0047E0] text-white px-6 py-3.5 rounded-lg font-medium text-[15px] transition-colors whitespace-nowrap"
            >
              시작하기
            </button>
          </div>
          <p className="text-[13px] text-[#6B7280]">
            {user ? (
              <button
                onClick={() => signOut()}
                className="text-[#0052FF] hover:underline"
              >
                로그아웃
              </button>
            ) : (
              <>
                이미 계정이 있으신가요?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#0052FF] hover:underline"
                >
                  로그인
                </button>
              </>
            )}
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop"
            alt="Dashboard Preview"
            className="w-full rounded-lg border border-[#E5E7EB] shadow-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-[#E5E7EB] bg-[#FAFAFA] py-12">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[#6B7280] mb-1">신뢰하는 사용자</p>
              <p className="text-[24px] font-semibold text-[#1A1A1A]">1,240+</p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B7280] mb-1">생성된 포트폴리오</p>
              <p className="text-[24px] font-semibold text-[#1A1A1A]">3,890+</p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B7280] mb-1">평균 점수 향상</p>
              <p className="text-[24px] font-semibold text-[#1A1A1A]">+23%</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#FCD34D] text-[#FCD34D]" />
                ))}
              </div>
              <span className="text-[14px] text-[#6B7280]">4.9/5.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-[1200px] mx-auto px-8 py-20">
        <div className="mb-12">
          <h2 className="text-[36px] font-semibold text-[#1A1A1A] mb-3">
            AI가 당신의 경험을 완성합니다
          </h2>
          <p className="text-[18px] text-[#6B7280]">
            간단한 입력만으로 성과 중심의 포트폴리오를 자동으로 생성하세요
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 hover:border-[#D1D5DB] transition-colors">
            <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-[#0052FF]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">
              AI 역질문 인터뷰
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-[1.6]">
              대화하듯 답변하면 AI가 숨겨진 성과를 발견합니다
            </p>
          </div>

          {/* Feature 2 */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 hover:border-[#D1D5DB] transition-colors">
            <div className="w-10 h-10 bg-[#F0FDF4] rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-[#10B981]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">
              성과 수치화
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-[1.6]">
              검증 가능한 데이터만 강조하여 신뢰도를 높입니다
            </p>
          </div>

          {/* Feature 3 */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 hover:border-[#D1D5DB] transition-colors">
            <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center mb-4">
              <FileStack className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">
              맞춤형 생성
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-[1.6]">
              직무와 기업에 맞춰 최적화된 버전을 생성합니다
            </p>
          </div>

          {/* Feature 4 */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 hover:border-[#D1D5DB] transition-colors">
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-[#EF4444]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">
              합격 가능성 분석
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-[1.6]">
              직무 요구사항 대비 매칭도를 점수화합니다
            </p>
          </div>

          {/* Feature 5 */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 hover:border-[#D1D5DB] transition-colors">
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">
              자동 교정
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-[1.6]">
              오탈자, 문맥, 중복을 자동으로 분석합니다
            </p>
          </div>

          {/* Feature 6 */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 hover:border-[#D1D5DB] transition-colors">
            <div className="w-10 h-10 bg-[#FCE7F3] rounded-lg flex items-center justify-center mb-4">
              <Search className="w-5 h-5 text-[#EC4899]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">
              왜곡 탐지
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-[1.6]">
              과장된 내용을 자동으로 표시합니다
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-[#FAFAFA] py-20">
        <div className="max-w-[1200px] mx-auto px-8">
          <h2 className="text-[36px] font-semibold text-[#1A1A1A] mb-12">
            3단계로 완성하는 포트폴리오
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
              <div className="w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-semibold mb-4">
                1
              </div>
              <h3 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
                경험 입력
              </h3>
              <p className="text-[15px] text-[#6B7280] leading-[1.6]">
                간단하게 경험을 입력하거나 SNS 프로필을 연동하세요
              </p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
              <div className="w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-semibold mb-4">
                2
              </div>
              <h3 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
                AI 인터뷰
              </h3>
              <p className="text-[15px] text-[#6B7280] leading-[1.6]">
                AI가 질문을 던지고 답변을 통해 성과를 구조화합니다
              </p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
              <div className="w-8 h-8 bg-[#0052FF] text-white rounded-full flex items-center justify-center font-semibold mb-4">
                3
              </div>
              <h3 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
                맞춤 생성
              </h3>
              <p className="text-[15px] text-[#6B7280] leading-[1.6]">
                지원하는 직무에 맞춰 최적화된 포트폴리오를 받으세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-[1200px] mx-auto px-8 py-20">
        <h2 className="text-[36px] font-semibold text-[#1A1A1A] mb-12">
          사용자 후기
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {testimonials.map((item, index) => (
            <div key={index} className="bg-white border border-[#E5E7EB] rounded-lg p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FCD34D] text-[#FCD34D]" />
                ))}
              </div>
              <p className="text-[15px] text-[#374151] leading-[1.6] mb-4">
                {item.text}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E5E7EB] rounded-full flex items-center justify-center text-[14px] font-semibold text-[#6B7280]">
                  {item.name[0]}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#1A1A1A]">{item.name}</p>
                  <p className="text-[13px] text-[#6B7280]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#FAFAFA] py-20">
        <div className="max-w-[800px] mx-auto px-8">
          <h2 className="text-[36px] font-semibold text-[#1A1A1A] mb-8">
            자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAFAFA] transition-colors"
                >
                  <span className="text-[16px] font-medium text-[#1A1A1A]">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#6B7280] transition-transform flex-shrink-0 ml-4 ${
                      openFAQ === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <div className="px-5 pb-5">
                    <p className="text-[15px] text-[#6B7280] leading-[1.6]">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="max-w-[1200px] mx-auto px-8 py-20">
        <div className="bg-[#0052FF] rounded-lg p-16 text-center">
          <h2 className="text-[40px] font-semibold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-[18px] text-white/90 mb-8">
            무료로 첫 포트폴리오를 만들어보세요
          </p>
          <button
            onClick={handleStart}
            className="bg-white hover:bg-gray-100 text-[#0052FF] px-8 py-4 rounded-lg font-semibold text-[16px] transition-colors"
          >
            무료로 시작하기
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const testimonials = [
  {
    name: "김민준",
    role: "콘텐츠 마케터",
    text: "AI 인터뷰 덕분에 제가 생각하지 못한 성과들을 발견했어요. 면접 준비 시간이 절반으로 줄었습니다."
  },
  {
    name: "이서연",
    role: "PM 지망생",
    text: "직무별로 포트폴리오를 다르게 만들 수 있어서 정말 편리했어요. 합격률이 눈에 띄게 올랐습니다."
  },
  {
    name: "박지훈",
    role: "UX 디자이너",
    text: "STAR 형식으로 자동 정리되니 훨씬 전문적으로 보여요. 추천합니다."
  },
  {
    name: "최수진",
    role: "개발자",
    text: "왜곡 탐지 기능이 인상적이었어요. 과장 없이 정직한 포트폴리오를 만들 수 있었습니다."
  },
];

const faqs = [
  {
    question: "BuildMe는 어떤 서비스인가요?",
    answer: "BuildMe는 AI 기반 포트폴리오 작성 플랫폼입니다. 간단한 경험 입력만으로 AI가 질문하고, 답변을 바탕으로 성과 중심의 STAR 형식 포트폴리오를 자동으로 생성합니다."
  },
  {
    question: "무료로 사용할 수 있나요?",
    answer: "기본 기능은 무료로 사용할 수 있으며, 프리미엄 기능(무제한 버전 생성, 고급 분석 등)은 유료 플랜을 통해 가능합니다."
  },
  {
    question: "어떤 직무에 사용할 수 있나요?",
    answer: "모든 직무에 사용 가능합니다. 마케팅, PM, 개발, 디자인, 운영 등 다양한 분야의 포트폴리오를 생성할 수 있습니다."
  },
  {
    question: "AI가 생성한 내용을 수정할 수 있나요?",
    answer: "네, 가능합니다. AI가 생성한 내용을 언제든지 수정하고 편집할 수 있습니다."
  },
  {
    question: "데이터는 안전하게 보관되나요?",
    answer: "사용자 데이터는 암호화되어 안전하게 보관되며, 본인의 동의 없이 제3자와 공유되지 않습니다."
  }
];