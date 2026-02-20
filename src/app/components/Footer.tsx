export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#FAFAFA]">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="grid grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/buildme-logo.png" alt="BuildMe" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <span className="text-[20px] font-semibold text-[#1A1A1A]">BuildMe</span>
            </div>
            <p className="text-[14px] text-[#6B7280] leading-[1.6]">
              AI 기반 포트폴리오 작성 플랫폼
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">제품</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  기능 소개
                </a>
              </li>
              <li>
                <a href="#" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  요금제
                </a>
              </li>
              <li>
                <a href="#" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  업데이트
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">지원</h3>
            <ul className="space-y-2">
              <li>
                <a href="/#faq" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  도움말
                </a>
              </li>
              <li>
                <a href="#" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  문의하기
                </a>
              </li>
              <li>
                <a href="#" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  피드백
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">약관</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-[13px] text-[#9CA3AF]">
            © 2026 BuildMe. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
              Twitter
            </a>
            <a href="#" className="text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
