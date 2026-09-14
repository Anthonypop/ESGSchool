/**
 * Design system reminder — 首頁如同一份展開的校園年報索引：左側閱讀脈絡、右側章節封面、米白留白與三種有意義的識別色。
 */
import { ArrowUpRight, BookOpenText, Leaf, Scale, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

const chapters = [
  { letter: "E", title: "環境", english: "Environment", description: "從能源、設施和資源消耗，建立校園碳排放的可追蹤基線。", href: "/environment", image: "/manus-storage/esg-environment_bed8f622.jpg", icon: Leaf, ink: "#173D35", pale: "#DDE9D9", index: "01" },
  { letter: "S", title: "社會", english: "Social", description: "檢視教職員、學生、共融與社區之間的支持與參與。", href: "/social", image: "/manus-storage/esg-social_17eb7d26.jpg", icon: UsersRound, ink: "#9A3E35", pale: "#F2DDD7", index: "02" },
  { letter: "G", title: "管治", english: "Governance", description: "記錄校董會、誠信、透明度與風險管理的校本制度。", href: "/governance", image: "/manus-storage/esg-governance_d684a5bd.jpg", icon: Scale, ink: "#273C73", pale: "#DEE3F1", index: "03" },
];

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F3EA] text-[#1D2823] selection:bg-[#DDE9D9]">
      <header className="border-b border-[#173D35]/15 bg-[#F7F3EA]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-10 lg:py-5">
          <div className="flex min-w-0 items-center gap-3"><img src="/manus-storage/esg-school-index-mark_f4865f8f.png" alt="School ESG Index 標誌" className="h-12 w-12 shrink-0 object-contain" /><div><p className="font-serif text-lg font-bold tracking-[0.1em] text-[#173D35]">學校 ESG 指數</p><p className="mt-0.5 text-[10px] font-bold tracking-[0.16em] text-[#64736A]">SCHOOL ESG INDEX</p></div></div>
          <div className="flex items-center gap-4"><p className="hidden border-l border-[#173D35]/15 pl-5 text-right text-xs leading-5 text-[#68756E] md:block">校園 ESG 自我檢視工具<br />環境 · 社會 · 管治</p>{!loading && <Link href="/portal" className={user ? "border border-[#173D35] px-3 py-2 text-xs font-bold text-[#173D35] transition hover:bg-[#173D35] hover:text-white" : "bg-[#173D35] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0F2D26]"}>{user ? "學校帳戶中心" : "登入／建立帳戶"}</Link>}</div>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10">
        <section className="relative mt-5 overflow-hidden bg-[#173D35] px-6 py-10 text-white shadow-[0_20px_45px_rgba(23,61,53,.14)] sm:mt-8 sm:px-9 sm:py-14 lg:grid lg:min-h-[410px] lg:grid-cols-[.92fr_1.08fr] lg:items-end lg:px-12 lg:py-16">
          <img src="/manus-storage/esg-index-editorial-hero_f2d55280.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,61,53,.97)_0%,rgba(23,61,53,.88)_48%,rgba(23,61,53,.18)_100%)]" />
          <div className="relative max-w-2xl"><p className="flex items-center gap-2 text-xs font-bold tracking-[0.17em] text-[#D9E4B9]"><BookOpenText className="h-4 w-4" /> CAMPUS RESPONSIBILITY REGISTER</p><h1 className="mt-5 font-serif text-4xl font-bold leading-[1.18] tracking-[0.025em] sm:text-5xl lg:text-6xl">把校園的長期承諾，<br />整理成可檢視的指標。</h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/80 sm:text-base">香港學校雖未有強制 ESG 披露要求，仍可從一致的資料基線開始，理解本校的環境、社會和管治表現。</p></div>
          <div className="relative mt-8 flex items-end justify-between border-t border-white/20 pt-4 text-xs text-white/70 lg:mt-0 lg:justify-end lg:border-0 lg:pt-0"><span className="lg:hidden">請選擇一個 ESG 範疇開始。</span><span className="font-serif text-6xl font-bold text-white/20 sm:text-8xl">2026</span></div>
        </section>
        <section className="mt-8"><div className="mb-5 flex flex-col gap-2 border-b border-[#173D35]/15 pb-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold tracking-[0.15em] text-[#173D35]">ESG INDEX</p><h2 className="mt-1 font-serif text-2xl font-bold">選擇一個校園章節</h2></div><p className="max-w-md text-sm leading-6 text-[#68756E]">每個範疇均可獨立填寫及更新，從當前校務資料開始建立自己的 ESG 評估檔案。</p></div>
          <div className="grid gap-4 lg:grid-cols-3">{chapters.map((chapter) => { const Icon = chapter.icon; return <Link key={chapter.letter} href={chapter.href} className="group relative min-h-[390px] overflow-hidden border border-[#173D35]/12 bg-white shadow-[0_10px_25px_rgba(28,45,35,.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(28,45,35,.13)]"><img src={chapter.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.84)_0%,rgba(255,255,255,.48)_35%,rgba(255,255,255,.93)_100%)]" /><div className="relative flex h-full min-h-[390px] flex-col p-6"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center border border-current/30 bg-white/75" style={{ color: chapter.ink }}><Icon className="h-5 w-5" /></span><span className="font-serif text-4xl font-bold opacity-35" style={{ color: chapter.ink }}>{chapter.index}</span></div><div className="mt-auto"><p className="text-xs font-bold tracking-[0.14em]" style={{ color: chapter.ink }}>{chapter.english.toUpperCase()}</p><h3 className="mt-1 font-serif text-4xl font-bold" style={{ color: chapter.ink }}>{chapter.letter} · {chapter.title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[#48584F]">{chapter.description}</p><div className="mt-5 flex items-center justify-between border-t border-[#173D35]/15 pt-4 text-xs font-bold" style={{ color: chapter.ink }}><span>進入此章節</span><ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" /></div></div></div></Link>; })}</div>
        </section>
        <section className="mt-8 grid gap-4 border-t border-[#173D35]/15 pt-6 md:grid-cols-3"><p className="font-serif text-lg font-bold text-[#173D35]">從一項可驗證的資料，開始看見校園的長期影響。</p><p className="text-sm leading-6 text-[#68756E]">環境章節保留 Scope 1、2、3 排放計算的逐步輸入方式與動態記錄列。</p><p className="text-sm leading-6 text-[#68756E]">社會和管治已分拆為獨立頁面，讓使用者專注完成每一套指標並即時查看其分數。</p></section>
      </main>
      <footer className="border-t border-[#173D35]/10 px-4 py-6 text-center text-xs text-[#6A766F]">學校 ESG 指數工具 · 供校內自我檢視及持續改善使用</footer>
    </div>
  );
}
