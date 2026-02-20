import { Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, FileText, MessageSquare, Sparkles, BarChart3, Settings, HelpCircle, Home, User } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../lib/auth";

const menuItems = [
  { path: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { path: "/experience", label: "경험 관리", icon: FileText },
  { path: "/interview", label: "AI 인터뷰", icon: MessageSquare },
  { path: "/job-match", label: "직무 맞춤", icon: Sparkles },
  { path: "/analytics", label: "분석 리포트", icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [usage, setUsage] = useState<{ usedToday: number; dailyLimit: number | null } | null>(null);
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    apiFetch<{ plan: string; usage: { analysis: { usedToday: number; dailyLimit: number | null } } }>("/me")
      .then((res) => {
        setPlan(res.plan);
        setUsage(res.usage.analysis);
      })
      .catch(() => {
        // ignore
      });
  }, []);

  return (
    <aside className="w-[240px] bg-white border-r border-[#E5E7EB] flex-shrink-0 fixed left-0 top-0 bottom-0 z-10 flex flex-col">
      <div className="p-6 border-b border-[#E5E7EB]">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/buildme-logo.png" alt="BuildMe" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          <span className="text-[18px] font-semibold text-[#1A1A1A]">BuildMe</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1A1A1A] transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>홈</span>
        </Link>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[14px]
                ${
                  isActive
                    ? "bg-[#EEF2FF] text-[#0052FF] font-medium"
                    : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1A1A1A]"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E5E7EB] space-y-1">
        <button
          onClick={() => navigate("/pricing")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1A1A1A] transition-colors"
        >
          <span className="w-5 h-5 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[11px] text-[#0052FF]">
            ₩
          </span>
          <span>요금제 / 비즈니스 모델</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1A1A1A] transition-colors">
          <Settings className="w-5 h-5" />
          <span>설정</span>
        </button>
        <Link
          to="/mypage"
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] transition-colors
            ${
              location.pathname === "/mypage"
                ? "bg-[#EEF2FF] text-[#0052FF] font-medium"
                : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1A1A1A]"
            }
          `}
        >
          <User className="w-5 h-5" />
          <span>마이페이지</span>
        </Link>
        <Link
          to="/#faq"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1A1A1A] transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          <span>도움말</span>
        </Link>
      </div>

      <div className="p-4 border-t border-[#E5E7EB]">
        <div className="bg-[#FAFAFA] rounded-lg p-4">
          <p className="text-[13px] font-medium text-[#1A1A1A] mb-1">
            {plan === "free" ? "무료 플랜" : plan === "premium" ? "프리미엄" : "B2B"}
          </p>
          <p className="text-[12px] text-[#6B7280] mb-3">
            {usage?.dailyLimit != null ? `${usage.usedToday}/${usage.dailyLimit} 분석 사용(오늘)` : plan === "free" ? "3회 분석 제한" : "무제한 분석"}
          </p>
          <button
            onClick={() => navigate("/pricing")}
            className="w-full bg-[#0052FF] hover:bg-[#0047E0] text-white text-[13px] font-medium py-2 rounded-lg transition-colors"
          >
            {plan === "free" ? "프리미엄으로 업그레이드" : plan === "premium" ? "B2B 문의" : "플랜 관리"}
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-[#6B7280] truncate max-w-[150px]">{user?.email}</p>
          <button
            onClick={() => signOut()}
            className="text-[12px] text-[#0052FF] hover:underline"
          >
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}
