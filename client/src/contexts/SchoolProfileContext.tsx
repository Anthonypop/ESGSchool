/**
 * Design system reminder — 共用基本資料是校務年報的封面資料欄，使用克制的資訊卡與暖白紙張質感。
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, GraduationCap, UsersRound } from "lucide-react";

export type SchoolProfile = {
  schoolName: string;
  reportYear: string;
  grossFloorArea: number;
  studentCount: number;
  staffCount: number;
};

const storageKey = "school-esg-index.profile";
const emptyNumber = Number.NaN;
const initialProfile: SchoolProfile = { schoolName: "", reportYear: "", grossFloorArea: emptyNumber, studentCount: emptyNumber, staffCount: emptyNumber };

type SchoolProfileContextValue = { profile: SchoolProfile; updateProfile: <K extends keyof SchoolProfile>(key: K, value: SchoolProfile[K]) => void };
const SchoolProfileContext = createContext<SchoolProfileContextValue | undefined>(undefined);

function normaliseProfile(value: Partial<SchoolProfile>): SchoolProfile {
  return {
    schoolName: typeof value.schoolName === "string" ? value.schoolName : "",
    reportYear: typeof value.reportYear === "string" ? value.reportYear : "",
    grossFloorArea: Number.isFinite(value.grossFloorArea) ? Number(value.grossFloorArea) : emptyNumber,
    studentCount: Number.isFinite(value.studentCount) ? Number(value.studentCount) : emptyNumber,
    staffCount: Number.isFinite(value.staffCount) ? Number(value.staffCount) : emptyNumber,
  };
}

export function SchoolProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<SchoolProfile>(() => {
    if (typeof window === "undefined") return initialProfile;
    try { return normaliseProfile(JSON.parse(window.localStorage.getItem(storageKey) || "{}")); } catch { return initialProfile; }
  });
  useEffect(() => { window.localStorage.setItem(storageKey, JSON.stringify(profile)); }, [profile]);
  const updateProfile = useCallback(<K extends keyof SchoolProfile>(key: K, value: SchoolProfile[K]) => setProfile((current) => ({ ...current, [key]: value })), []);
  const value = useMemo(() => ({ profile, updateProfile }), [profile, updateProfile]);
  return <SchoolProfileContext.Provider value={value}>{children}</SchoolProfileContext.Provider>;
}

export function useSchoolProfile() {
  const context = useContext(SchoolProfileContext);
  if (!context) throw new Error("useSchoolProfile 必須在 SchoolProfileProvider 內使用。");
  return context;
}

function NumberProfileField({ label, value, onChange, suffix, icon: Icon }: { label: string; value: number; onChange: (value: number) => void; suffix: string; icon: typeof Building2 }) {
  return <label className="block border border-[#173D35]/10 bg-[#FCFBF7] p-3 transition focus-within:border-[#173D35]/40"><span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] text-[#66756C]"><Icon className="h-3.5 w-3.5 text-[#173D35]" />{label}</span><span className="mt-2 flex items-center gap-2"><input type="number" min="0" value={Number.isFinite(value) ? value : ""} onChange={(event) => onChange(event.currentTarget.value === "" ? Number.NaN : Number(event.currentTarget.value))} className="min-w-0 flex-1 border-b border-[#173D35]/20 bg-transparent px-0 py-1 font-serif text-lg font-bold text-[#173D35] outline-none placeholder:text-sm placeholder:font-sans placeholder:font-normal" placeholder="請輸入" /><span className="text-[11px] font-semibold text-[#718078]">{suffix}</span></span></label>;
}

export function SchoolProfilePanel() {
  const { profile, updateProfile } = useSchoolProfile();
  return <section className="mb-6 border border-[#173D35]/12 bg-white p-4 shadow-[0_10px_30px_rgba(28,45,35,.05)] sm:p-5"><div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[#173D35]/10 pb-3"><div><p className="text-[10px] font-bold tracking-[0.14em] text-[#173D35]">共用資料</p><h2 className="mt-1 font-serif text-xl font-bold text-[#1F2D26]">學校基本資料</h2></div><p className="max-w-md text-xs leading-5 text-[#718078]">資料會自動同步至環境、社會及管治頁面，並供相關指標計算使用。</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"><label className="block border border-[#173D35]/10 bg-[#FCFBF7] p-3 transition focus-within:border-[#173D35]/40 xl:col-span-1"><span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] text-[#66756C]"><Building2 className="h-3.5 w-3.5 text-[#173D35]" />學校名稱</span><input value={profile.schoolName} onChange={(event) => updateProfile("schoolName", event.currentTarget.value)} placeholder="請輸入" className="mt-2 w-full border-b border-[#173D35]/20 bg-transparent px-0 py-1 text-sm font-semibold text-[#173D35] outline-none placeholder:font-normal" /></label><label className="block border border-[#173D35]/10 bg-[#FCFBF7] p-3 transition focus-within:border-[#173D35]/40"><span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] text-[#66756C]"><CalendarDays className="h-3.5 w-3.5 text-[#173D35]" />報告年度</span><input value={profile.reportYear} onChange={(event) => updateProfile("reportYear", event.currentTarget.value)} placeholder="例如：2025/2026" className="mt-2 w-full border-b border-[#173D35]/20 bg-transparent px-0 py-1 text-sm font-semibold text-[#173D35] outline-none placeholder:font-normal" /></label><NumberProfileField label="總樓面面積" value={profile.grossFloorArea} onChange={(value) => updateProfile("grossFloorArea", value)} suffix="平方米" icon={Building2} /><NumberProfileField label="全校學生人數" value={profile.studentCount} onChange={(value) => updateProfile("studentCount", value)} suffix="人" icon={GraduationCap} /><NumberProfileField label="全職教職員人數" value={profile.staffCount} onChange={(value) => updateProfile("staffCount", value)} suffix="人" icon={UsersRound} /></div></section>;
}
