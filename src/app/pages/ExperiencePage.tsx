import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { FileText, Plus, MoreVertical, Calendar, ArrowLeft } from "lucide-react";
import { apiFetch } from "../../lib/api";

export function ExperiencePage() {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<{ experiences: any[] }>("/experiences").then((res) => setExperiences(res.experiences ?? []));
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#6B7280]" />
            </button>
            <div>
              <h1 className="text-[24px] font-semibold text-[#1A1A1A] mb-1">경험 관리</h1>
              <p className="text-[14px] text-[#6B7280]">저장된 경험을 관리하고 새로운 경험을 추가하세요</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/interview")}
            className="flex items-center gap-2 bg-[#0052FF] hover:bg-[#0047E0] text-white px-5 py-2.5 rounded-lg font-medium text-[15px] transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 경험 추가
          </button>
        </div>

        {/* Experience Cards */}
        <div className="grid grid-cols-2 gap-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-white border border-[#E5E7EB] rounded-lg p-6 hover:border-[#D1D5DB] transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#0052FF]" />
                </div>
                <button className="p-1.5 hover:bg-[#F9FAFB] rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-[#6B7280]" />
                </button>
              </div>

              <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-1">
                {exp.title || "제목 없음"}
              </h3>
              <p className="text-[13px] text-[#6B7280] mb-3">
                {exp.source_type === "link" ? "SNS 링크" : "텍스트 입력"}
              </p>

              <div className="flex items-center gap-1.5 text-[13px] text-[#9CA3AF] mb-4">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(exp.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-0.5">상태</p>
                  <p className="text-[18px] font-semibold text-[#1A1A1A]">저장됨</p>
                </div>
                <span className="bg-[#F0FDF4] text-[#10B981] px-3 py-1 rounded-full text-[12px] font-medium">
                  저장
                </span>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <button
            onClick={() => navigate("/interview")}
            className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 hover:border-[#0052FF] hover:bg-[#FAFAFA] transition-all cursor-pointer flex items-center justify-center min-h-[240px]"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-[#F9FAFB] rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-[#9CA3AF]" />
              </div>
              <p className="text-[15px] font-medium text-[#6B7280]">새 경험 추가하기</p>
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
