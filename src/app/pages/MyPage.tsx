import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { User, Briefcase, Award, Target, CheckCircle2, RefreshCw } from "lucide-react";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../lib/onboardingStore";

const purposes = [
  { id: "job", label: "취업 지원" },
  { id: "career", label: "이직 준비" },
  { id: "freelance", label: "프리랜서 / 외주" },
  { id: "branding", label: "개인 브랜딩" },
];

export function MyPage() {
  const [name, setName] = useState("홍길동");
  const [bio, setBio] = useState("데이터로 문제를 해결하는 마케터");
  const [job, setJob] = useState("콘텐츠 마케터");
  const [experience, setExperience] = useState(`• (주)테크컴퍼니 / 2022.03 ~ 2024.02 / 마케팅팀
  - SNS 콘텐츠 기획 및 운영
  - 광고 캠페인 성과 분석

• 00대학교 창업동아리 / 2021.09 ~ 2022.02 / 기획팀장
  - 서비스 기획 및 사용자 리서치 진행`);
  const [achievement, setAchievement] = useState(`• SNS 콘텐츠 전략 변경으로 팔로워 수 3개월간 40% 증가

• 고객 불만 접수 프로세스를 개선해 응답 시간 평균 2일 단축`);
  const [purpose, setPurpose] = useState("career");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [readyToSave, setReadyToSave] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadOnboardingDraft().then((draft) => {
      if (cancelled) return;
      setName(draft.payload.name || "홍길동");
      setBio(draft.payload.bio || "데이터로 문제를 해결하는 마케터");
      setJob(draft.payload.targetJob || "콘텐츠 마케터");
      setExperience(
        draft.payload.experience ||
          `• (주)테크컴퍼니 / 2022.03 ~ 2024.02 / 마케팅팀
  - SNS 콘텐츠 기획 및 운영
  - 광고 캠페인 성과 분석

• 00대학교 창업동아리 / 2021.09 ~ 2022.02 / 기획팀장
  - 서비스 기획 및 사용자 리서치 진행`,
      );
      setAchievement(
        draft.payload.achievement ||
          `• SNS 콘텐츠 전략 변경으로 팔로워 수 3개월간 40% 증가

• 고객 불만 접수 프로세스를 개선해 응답 시간 평균 2일 단축`,
      );
      setPurpose(draft.payload.purpose || "career");
      if (draft.updatedAt) {
        const parsed = new Date(draft.updatedAt);
        if (!Number.isNaN(parsed.getTime())) {
          setLastSaved(parsed);
        }
      }
      setReadyToSave(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!readyToSave) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsSaving(true);
      void saveOnboardingDraft({
        payloadPatch: {
          name,
          bio,
          targetJob: job,
          experience,
          achievement,
          purpose,
        },
      })
        .then((saved) => {
          if (cancelled) return;
          const parsed = new Date(saved.updatedAt);
          setLastSaved(Number.isNaN(parsed.getTime()) ? new Date() : parsed);
        })
        .finally(() => {
          if (!cancelled) {
            setIsSaving(false);
          }
        });
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [readyToSave, name, bio, job, experience, achievement, purpose]);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[1000px] mx-auto">
        <div className="mb-8">
          <h1 className="text-[28px] font-semibold text-[#1A1A1A] mb-2">내 정보 관리</h1>
          <p className="text-[15px] text-[#6B7280] mb-4">
            온보딩에서 입력한 정보입니다. 포트폴리오 생성과 수정에 사용되며, 언제든지 변경할 수 있어요.
          </p>

          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 text-[#0052FF] animate-spin" />
                <span className="text-[13px] text-[#0052FF] font-medium">저장 중...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span className="text-[13px] text-[#10B981] font-medium">모든 변경사항 저장됨</span>
                <span className="text-[13px] text-[#9CA3AF]">
                  · {lastSaved.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-[#0052FF]" />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-[#1A1A1A]">기본 정보</h2>
                <p className="text-[13px] text-[#6B7280]">포트폴리오 상단에 표시되는 정보입니다</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="포트폴리오에 표시될 이름을 입력해주세요"
                  className="w-full bg-white border border-[#D1D5DB] rounded-lg px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">한 줄 소개</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="간단한 소개 문장을 작성해보세요"
                  className="w-full bg-white border border-[#D1D5DB] rounded-lg px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#0052FF]" />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-[#1A1A1A]">직무 정보</h2>
                <p className="text-[13px] text-[#6B7280]">포트폴리오의 전체 방향과 톤에 영향을 줍니다</p>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">직무</label>
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="현재 또는 희망하는 직무를 입력해주세요"
                className="w-full bg-white border border-[#D1D5DB] rounded-lg px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all"
              />
            </div>
          </section>

          <section className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-[#0052FF]" />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-[#1A1A1A]">경력 정보</h2>
                <p className="text-[13px] text-[#6B7280]">포트폴리오의 주요 콘텐츠로 사용됩니다</p>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">경험</label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="회사명, 기간, 담당 업무를 중심으로 작성해 주세요. 아직 정리되지 않은 내용도 괜찮아요."
                className="w-full min-h-[200px] bg-white border border-[#D1D5DB] rounded-lg px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all resize-none leading-[1.6]"
              />
            </div>
          </section>

          <section className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-[#0052FF]" />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-[#1A1A1A]">성과 및 프로젝트</h2>
                <p className="text-[13px] text-[#6B7280]">본인의 강점을 가장 잘 보여줄 수 있는 내용입니다</p>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">주요 성과</label>
              <textarea
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                placeholder="결과보다는 역할과 문제 해결 과정을 중심으로 작성해도 좋아요"
                className="w-full min-h-[160px] bg-white border border-[#D1D5DB] rounded-lg px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:border-transparent transition-all resize-none leading-[1.6]"
              />
            </div>
          </section>

          <section className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-[#0052FF]" />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-[#1A1A1A]">포트폴리오 목적</h2>
                <p className="text-[13px] text-[#6B7280]">목적에 따라 포트폴리오 구성과 강조 포인트가 달라집니다</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {purposes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPurpose(item.id)}
                  className={`
                    px-4 py-3 rounded-lg text-[14px] font-medium transition-all border-2
                    ${
                      purpose === item.id
                        ? "border-[#0052FF] bg-[#EEF2FF] text-[#0052FF]"
                        : "border-[#E5E7EB] bg-white text-[#1A1A1A] hover:border-[#D1D5DB]"
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] text-[#1A1A1A] font-medium mb-1">
                  변경한 내용은 자동으로 저장되어 포트폴리오에 반영됩니다
                </p>
                <p className="text-[13px] text-[#6B7280]">
                  입력한 정보는 서비스 내에 안전하게 저장됩니다. 포트폴리오 제작 및 관리 목적에만 사용되며, 사용자는
                  언제든 자신의 정보를 수정하거나 업데이트할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
