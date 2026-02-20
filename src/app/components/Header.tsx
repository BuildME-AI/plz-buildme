import { useNavigate, useLocation } from "react-router";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../lib/auth";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleStart = () => {
    if (user) navigate("/onboarding/step1");
    else navigate("/login?redirect=/onboarding/step1");
  };

  const handleDashboard = () => {
    if (user) navigate("/dashboard");
    else navigate("/login?redirect=/dashboard");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src="/buildme-logo.png" alt="BuildMe" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          <span className="text-[20px] font-semibold text-[#1A1A1A]">BuildMe</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <button
            onClick={handleDashboard}
            className="text-[15px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          >
            대시보드
          </button>
          <a href="#features" className="text-[15px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
            기능
          </a>
          <button
            onClick={() => navigate("/pricing")}
            className="text-[15px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          >
            요금제
          </button>
          <a href="#faq" className="text-[15px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
            FAQ
          </a>
          {user ? (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[15px] text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-[15px] text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
            >
              로그인
            </button>
          )}
          <button
            onClick={handleStart}
            className="bg-[#0052FF] hover:bg-[#0047E0] text-white px-5 py-2 rounded-lg text-[15px] font-medium transition-colors"
          >
            시작하기
          </button>
        </nav>
      </div>
    </header>
  );
}