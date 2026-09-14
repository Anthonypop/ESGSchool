import { useAuth } from "@/_core/hooks/useAuth";
import { useSchoolProfile } from "@/contexts/SchoolProfileContext";
import { trpc } from "@/lib/trpc";
import { Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function SubmissionActions({ section, data }: { section: "environment" | "social" | "governance"; data: Record<string, unknown> }) {
  const { profile } = useSchoolProfile();
  const { user, loading } = useAuth();
  const save = trpc.esg.saveSection.useMutation({ onSuccess: () => toast.success("已儲存為草稿，可到帳戶中心正式提交。") });
  const labels = { environment: "環境", social: "社會", governance: "管治" };
  const saveDraft = async () => {
    if (!user) { window.location.href = "/portal"; return; }
    if (!profile.schoolName.trim() || !profile.reportYear.trim()) return toast.error("請先於上方填寫學校名稱及報告年度。");
    try { await save.mutateAsync({ section, profile, data }); } catch (error) { toast.error(error instanceof Error ? error.message : "儲存草稿時發生問題。") }
  };
  return <section className="mt-7 flex flex-col gap-3 border-y border-[#173D35]/12 bg-white/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-[#173D35]" /><p className="text-xs leading-5 text-[#68756E]">{user ? `目前以 ${user.name || "學校帳戶"} 的帳戶填報。儲存後可在帳戶中心完成正式提交。` : "登入後可將本章資料儲存至學校帳戶，並於帳戶中心提交評核。"}</p></div><button disabled={loading || save.isPending} onClick={saveDraft} className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#173D35] px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0F2D26] disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{user ? (save.isPending ? "儲存中…" : `儲存${labels[section]}草稿`) : "登入以儲存填報"}</button></section>;
}
