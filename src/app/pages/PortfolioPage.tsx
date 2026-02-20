import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Modal } from "../components/Modal";
import { Download, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function PortfolioPage() {
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/job-match")}
              className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
            <div className="flex-1">
              <h1 className="text-[24px] font-semibold text-[#1A1A1A]">최종 포트폴리오</h1>
              <p className="text-[14px] text-[#6B7280]">콘텐츠 마케팅 직무 맞춤</p>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 bg-[#0052FF] hover:bg-[#0047E0] text-white px-5 py-2.5 rounded-lg font-medium text-[15px] transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF 내보내기
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left - Main Content */}
          <div className="col-span-2 bg-white border border-[#E5E7EB] rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-1">
                재고 관리 프로세스 개선을 통한 폐기율 감소
              </h2>
              <p className="text-[13px] text-[#6B7280]">카페 아르바이트 · 2024.03 - 2024.12</p>
            </div>

            <div className="space-y-6">
              {/* Situation */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#0052FF] mb-2">상황 (Situation)</h3>
                <p className="text-[14px] text-[#374151] leading-[1.6]">
                  카페 아르바이트 중 재고 관리 업무를 담당하며, 기존 수기 관리 방식으로 인해 재고 파악이 어렵고 폐기율이 높은 문제를 발견했습니다.
                </p>
              </div>

              {/* Task */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#0052FF] mb-2">과제 (Task)</h3>
                <p className="text-[14px] text-[#374151] leading-[1.6]">
                  재고 관리 프로세스를 체계화하여 폐기율을 낮추고 효율적인 재고 회전율을 달성하는 것이 목표였습니다.
                </p>
              </div>

              {/* Action */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#0052FF] mb-2">행동 (Action)</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#0052FF] mt-1">•</span>
                    <p className="text-[14px] text-[#374151] leading-[1.6]">
                      <span className="font-semibold">선입선출(FIFO) 원칙 도입:</span> 유통기한이 가까운 제품을 우선 사용하도록 재고 배치 시스템 구축
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0052FF] mt-1">•</span>
                    <p className="text-[14px] text-[#374151] leading-[1.6]">
                      <span className="font-semibold">일일 재고 체크리스트 작성:</span> 유통기한 관리 시스템을 통해 데이터 기반 의사결정 가능
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0052FF] mt-1">•</span>
                    <p className="text-[14px] text-[#374151] leading-[1.6]">
                      <span className="font-semibold">팀원 교육 및 프로세스 정착:</span> 새로운 시스템에 대한 교육 진행 및 협업 문화 조성
                    </p>
                  </li>
                </ul>
              </div>

              {/* Result */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#0052FF] mb-2">결과 (Result)</h3>
                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                      <p className="text-[14px] text-[#374151] leading-[1.6]">
                        <span className="font-semibold">한 달 기준 폐기율 15% 감소</span> 달성
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                      <p className="text-[14px] text-[#374151] leading-[1.6]">
                        재고 회전율 개선으로 신선한 재료 제공 가능
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-2">핵심 역량</h3>
                <div className="flex flex-wrap gap-2">
                  {["데이터 분석", "프로세스 개선", "팀 협업", "문제 해결", "성과 측정"].map((skill, i) => (
                    <span
                      key={i}
                      className="bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] px-3 py-1.5 rounded-lg text-[13px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div className="space-y-4">
            {/* Score Card */}
            <div className="bg-[#10B981] text-white rounded-lg p-6">
              <h3 className="text-[15px] font-medium mb-3">분석 점수</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[40px] font-bold">82</span>
                <span className="text-[16px] opacity-80">/100</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="opacity-90">구체성</span>
                  <span className="font-semibold">85점</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="opacity-90">직무 적합도</span>
                  <span className="font-semibold">78점</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="opacity-90">성과 중심</span>
                  <span className="font-semibold">84점</span>
                </div>
              </div>
            </div>

            {/* Job Match */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
              <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">직무 매칭도</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#6B7280]">콘텐츠 마케팅</span>
                  <span className="text-[13px] font-semibold text-[#0052FF]">78%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0052FF] w-[78%]"></div>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
              <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">개선 제안</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#F59E0B]">💡</span>
                  <p className="text-[13px] text-[#6B7280] leading-[1.5]">
                    구체적인 기간(예: 3개월) 명시 권장
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981]">✓</span>
                  <p className="text-[13px] text-[#6B7280] leading-[1.5]">
                    정량적 지표가 잘 표현됨
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="PDF 내보내기">
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-[#10B981]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">내보내기 준비 완료</h3>
          <p className="text-[14px] text-[#6B7280] mb-6">
            포트폴리오가 PDF 형식으로 저장됩니다.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowExportModal(false)}
              className="flex-1 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] py-2.5 rounded-lg font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                setTimeout(() => setShowExportModal(false), 500);
              }}
              className="flex-1 bg-[#0052FF] hover:bg-[#0047E0] text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              다운로드
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
