/**
 * Design system reminder — 校園年報：米白紙張、章節側欄索引、年輪印記、細線頁碼與克制留白。
 * 本元件把每個輸入頁固定在「側欄索引＋篇章畫布」的報告閱讀框架中。
 */
import { ArrowLeft, BookOpenText, Home, Leaf, Scale, UsersRound } from "lucide-react";
import { Link } from "wouter";
import type { ReactNode } from "react";
import { SchoolProfilePanel } from "@/contexts/SchoolProfileContext";

type Chapter = "environment" | "social" | "governance";

const chapterMeta: Record<Chapter, { letter: string; folio: string; name: string; accent: string; pale: string; icon: typeof Leaf }> = {
  environment: { letter: "E", folio: "01", name: "環境", accent: "#173D35", pale: "#DDE9D9", icon: Leaf },
  social: { letter: "S", folio: "02", name: "社會", accent: "#9A3E35", pale: "#F2DDD7", icon: UsersRound },
  governance: { letter: "G", folio: "03", name: "管治", accent: "#273C73", pale: "#DEE3F1", icon: Scale },
};

const sectionNotes: Record<Chapter, string[]> = {
  environment: ["01 · 範疇一：直接排放", "02 · 範疇二：能源間接", "03 · 範疇三：其他間接", "04 · 排放總覽"],
  social: ["S1 · 教職員權益", "S2 · 學生福祉", "S3 · 教育公平", "S4 · 社區連結"],
  governance: ["G1 · 校董會治理", "G2 · 廉潔誠信", "G3 · 資訊透明", "G4 · 風險保障"],
};

export function EsgLayout({ chapter, eyebrow, title, description, image, children }: { chapter: Chapter; eyebrow: string; title: string; description: string; image: string; children: ReactNode }) {
  const active = chapterMeta[chapter];
  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#1D2823] selection:bg-[#DDE9D9]">
      <header className="sticky top-0 z-40 border-b border-[#173D35]/15 bg-[#F7F3EA]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <Link href="/" className="group flex min-w-0 items-center gap-3"><img className="h-10 w-10 shrink-0 object-contain transition-transform duration-200 group-hover:-rotate-6" src="/esg-school-index-mark_f4865f8f.png" alt="學校 ESG 指數標誌" /><span className="hidden min-w-0 leading-tight sm:block"><strong className="block font-serif text-base tracking-[0.08em] text-[#173D35]">學校 ESG 指數</strong><span className="block text-[10px] font-semibold tracking-[0.14em] text-[#64736A]">校園自我檢視工具</span></span></Link>
          <nav aria-label="主要導覽" className="flex items-center gap-1 text-xs font-bold sm:gap-2 sm:text-sm"><Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[#45544C] transition hover:bg-white hover:text-[#173D35] sm:px-3"><Home className="h-4 w-4" /><span className="hidden md:inline">ESG 索引</span></Link>{(Object.keys(chapterMeta) as Chapter[]).map((key) => { const item = chapterMeta[key]; const ItemIcon = item.icon; const route = key === "environment" ? "/environment" : key === "social" ? "/social" : "/governance"; return <Link key={key} href={route} aria-current={key === chapter ? "page" : undefined} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 transition sm:px-3 ${key === chapter ? "bg-[#173D35] text-white shadow-sm" : "text-[#45544C] hover:bg-white"}`}><ItemIcon className="h-4 w-4" /><span className="hidden sm:inline">{item.name}</span></Link>; })}</nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-5 sm:px-6 lg:px-10 lg:pt-8">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-[#607068] transition hover:-translate-x-0.5 hover:text-[#173D35]"><ArrowLeft className="h-4 w-4" /> 返回 ESG 索引</Link>
        <section className="relative overflow-hidden border border-[#173D35]/10 bg-[#173D35] px-6 py-8 text-white shadow-[0_16px_40px_rgba(23,61,53,0.12)] sm:px-8 lg:px-11 lg:py-11">
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-luminosity" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,61,53,.96)_0%,rgba(23,61,53,.82)_48%,rgba(23,61,53,.45)_100%)]" /><div className="absolute bottom-0 left-0 top-0 w-2" style={{ backgroundColor: active.accent }} /><div className="absolute -bottom-16 right-12 h-48 w-48 rounded-full border border-white/25" /><div className="absolute -bottom-7 right-20 h-32 w-32 rounded-full border border-white/25" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_150px] lg:items-end"><div><p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#D9E4B9]"><BookOpenText className="h-4 w-4" /> {eyebrow}</p><h1 className="max-w-3xl font-serif text-3xl font-bold tracking-[0.02em] sm:text-4xl lg:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/82 sm:text-base">{description}</p></div><div className="flex items-end gap-3 lg:justify-end"><span className="font-serif text-7xl font-bold leading-none text-white/20">{active.letter}</span><span className="mb-1 text-xs font-bold tracking-[0.18em] text-[#D9E4B9]">章節</span></div></div>
        </section>

        <div className="mt-6 lg:grid lg:grid-cols-[172px_minmax(0,1fr)] lg:gap-7">
          <aside className="relative hidden lg:block" aria-label="本章索引">
            <div className="sticky top-[88px] overflow-hidden border-y border-[#173D35]/15 py-5">
              <div className="absolute -right-14 -top-8 h-36 w-36 rounded-full border border-[#173D35]/10" /><div className="absolute -right-6 top-2 h-24 w-24 rounded-full border border-[#173D35]/10" /><div className="relative">
                <p className="text-[10px] font-bold tracking-[0.15em] text-[#718078]">章節頁碼</p><div className="mt-2 flex items-end gap-2"><span className="font-serif text-5xl font-bold leading-none" style={{ color: active.accent }}>{active.folio}</span><span className="mb-1 text-[10px] font-bold tracking-[0.12em] text-[#718078]">／ ESG</span></div>
                <div className="mt-5 border-l-2 pl-3" style={{ borderColor: active.accent }}><p className="text-[10px] font-bold tracking-[0.14em]" style={{ color: active.accent }}>ESG 章節</p><p className="mt-1 font-serif text-lg font-bold text-[#26362D]">{active.letter} · {active.name}</p></div>
                <ol className="mt-6 space-y-3 border-l border-[#173D35]/15 pl-3">{sectionNotes[chapter].map((note, index) => <li key={note} className="relative text-[11px] leading-4 text-[#66756C]"><span className="absolute -left-[17px] top-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: index === 0 ? active.accent : "#AAB4AB" }} />{note}</li>)}</ol>
                <div className="mt-7 border-t border-[#173D35]/12 pt-4"><p className="text-[10px] font-bold tracking-[0.12em] text-[#718078]">填報說明</p><p className="mt-2 text-[11px] leading-5 text-[#65736B]">所有資料會於輸入時即時折算，請按本校可驗證的年度紀錄填報。</p></div>
              </div>
            </div>
          </aside>
          <div className="min-w-0"><SchoolProfilePanel />{children}</div>
        </div>
      </main>
      <footer className="border-t border-[#173D35]/10 px-4 py-6 text-center text-xs leading-6 text-[#6A766F]">學校 ESG 指數工具 · 供校內自我檢視及持續改善使用</footer>
    </div>
  );
}

export function ScoreStamp({ score, label, tone = "green", visible = false }: { score: number; label: string; tone?: "green" | "red" | "blue"; visible?: boolean }) {
  const colors = { green: "#173D35", red: "#9A3E35", blue: "#273C73" };
  if (!visible) return null;
  return <div className="relative inline-flex min-w-[146px] overflow-hidden border-l-4 bg-white px-4 py-3 shadow-[0_8px_18px_rgba(28,45,35,.06)]" style={{ borderLeftColor: colors[tone] }}><span className="absolute -bottom-8 -right-4 h-20 w-20 rounded-full border opacity-20" style={{ borderColor: colors[tone] }} /><span className="absolute -bottom-1 right-5 h-10 w-10 rounded-full border opacity-20" style={{ borderColor: colors[tone] }} /><span className="relative flex flex-col"><span className="text-[10px] font-bold tracking-[0.12em] text-[#6A766F]">{label}</span><span className="mt-1 font-serif text-3xl font-bold leading-none" style={{ color: colors[tone] }}>{Math.round(score)}</span><span className="mt-1 text-[10px] font-bold tracking-[0.12em] text-[#6A766F]">／ 100</span></span></div>;
}
