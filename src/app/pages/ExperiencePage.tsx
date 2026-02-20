import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import { FileText, Plus, Calendar, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { apiFetch } from "../../lib/api";

type ExperienceItem = {
  id: string;
  title: string | null;
  source_type: "text" | "link";
  source_text?: string | null;
  source_url?: string | null;
  created_at: string;
  updated_at: string;
};

export function ExperiencePage() {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);

  const fetchExperiences = async () => {
    const res = await apiFetch<{ experiences: ExperienceItem[] }>("/experiences");
    setExperiences(res.experiences ?? []);
  };

  useEffect(() => {
    void fetchExperiences();
  }, []);

  const handleEdit = async (exp: ExperienceItem) => {
    const nextTitle = window.prompt("경험 제목 수정", exp.title || "");
    if (nextTitle == null) return;

    const currentSource = exp.source_type === "text" ? exp.source_text || "" : "";
    const nextSource = window.prompt("경험 내용 수정", currentSource);
    if (nextSource == null) return;

    await apiFetch<{ experience: ExperienceItem }>(`/experiences/${exp.id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: nextTitle.trim() || "제목 없음",
        sourceText: nextSource.trim() || "내용 없음",
      }),
    });
    await fetchExperiences();
  };

  const handleDelete = async (exp: ExperienceItem) => {
    if (!window.confirm("이 경험을 삭제할까요?")) return;
    await apiFetch<{ ok: boolean }>(`/experiences/${exp.id}`, {
      method: "DELETE",
    });
    await fetchExperiences();
  };

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
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleEdit(exp)}
                    className="p-1.5 hover:bg-[#F3F4F6] rounded"
                    aria-label="경험 수정"
                  >
                    <Pencil className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(exp)}
                    className="p-1.5 hover:bg-[#FEF2F2] rounded"
                    aria-label="경험 삭제"
                  >
                    <Trash2 className="w-4 h-4 text-[#DC2626]" />
                  </button>
                </div>
              </div>

              <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-1">
                {exp.title || "제목 없음"}
              </h3>
              <p className="text-[13px] text-[#6B7280] mb-3">
                {exp.source_type === "link" ? "SNS 링크" : "텍스트 입력"}
              </p>
              {exp.source_type === "text" && (
                <p className="text-[13px] text-[#4B5563] mb-3">
                  {(exp.source_text || "내용 없음").slice(0, 90)}
                  {(exp.source_text || "").length > 90 ? "..." : ""}
                </p>
              )}

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
