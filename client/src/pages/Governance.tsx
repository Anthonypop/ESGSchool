/**
 * Design system reminder — 管治章節使用靛藍作章節印記，以嚴謹網格、透明欄位和穩定留白表達問責與可信度。
 */
import { useMemo, useState } from "react";
import { CheckField, FieldSet, NumberField, SectionCard, SelectField, TextAreaField } from "@/components/FormPrimitives";
import { EsgLayout } from "@/components/EsgLayout";
import { SubmissionActions } from "@/components/SubmissionActions";

type GovernanceInput = {
  missing: number; diversity: string; boardTraining: number;
  procurementIssues: number; declarationRate: number; reportChannel: boolean; reportChannelDetail: string; icacTalk: boolean; icacTalkDetail: string;
  annualReport: boolean; annualReportDetail: string; developmentPlan: boolean; developmentPlanDetail: string; ptaSu: boolean; ptaSuDetail: string; complaintSop: boolean; complaintSopDetail: string; overdue: number;
  scrcChecked: number; scrcPending: number; scrcNoPlan: number; privacyDetail: string; cyberDetail: string;
};

const emptyNumber = Number.NaN;
const initial: GovernanceInput = { missing: emptyNumber, diversity: "30", boardTraining: emptyNumber, procurementIssues: emptyNumber, declarationRate: emptyNumber, reportChannel: true, reportChannelDetail: "", icacTalk: true, icacTalkDetail: "", annualReport: true, annualReportDetail: "", developmentPlan: true, developmentPlanDetail: "", ptaSu: true, ptaSuDetail: "", complaintSop: true, complaintSopDetail: "", overdue: emptyNumber, scrcChecked: emptyNumber, scrcPending: emptyNumber, scrcNoPlan: emptyNumber, privacyDetail: "", cyberDetail: "" };
const clamp = (value: number) => Math.max(0, Math.min(100, value));
const numeric = (value: number) => Number.isFinite(value) ? value : 0;

function calculate(value: GovernanceInput) {
  const missing = numeric(value.missing); const boardTraining = numeric(value.boardTraining); const procurementIssues = numeric(value.procurementIssues); const declarationRate = numeric(value.declarationRate); const overdue = numeric(value.overdue); const scrcChecked = numeric(value.scrcChecked); const scrcPending = numeric(value.scrcPending); const scrcNoPlan = numeric(value.scrcNoPlan);
  const g1 = clamp(Math.max(0, 40 - missing * 8) + Number(value.diversity) + (boardTraining >= 10 ? 30 : boardTraining / 10 * 30));
  const g2 = clamp(Math.max(0, 40 - procurementIssues * 15) + declarationRate / 100 * 30 + (value.reportChannel ? 15 : 0) + (value.icacTalk ? 15 : 0));
  const complaint = Math.max(0, (value.complaintSop ? 15 : 0) + Math.max(-15, 15 - overdue * 5));
  const g3 = clamp((value.annualReport ? 20 : 0) + (value.developmentPlan ? 20 : 0) + (value.ptaSu ? 30 : 0) + complaint);
  const scrcTotal = scrcChecked + scrcPending + scrcNoPlan;
  const g4 = clamp(scrcTotal === 0 ? 0 : scrcNoPlan > 0 ? 0 : scrcPending > 0 ? 20 : scrcChecked === scrcTotal ? 40 : 0);
  return { total: (g1 + g2 + g3 + g4) / 4 };
}

function DescribedCheck({ label, detail, checked, onCheckedChange, descriptionLabel, description, onDescriptionChange, placeholder }: { label: string; detail: string; checked: boolean; onCheckedChange: (next: boolean) => void; descriptionLabel: string; description: string; onDescriptionChange: (next: string) => void; placeholder: string }) {
  return <div><CheckField label={label} detail={detail} checked={checked} onChange={onCheckedChange} />{checked && <div className="mt-2 pl-3"><TextAreaField label={descriptionLabel} value={description} onChange={onDescriptionChange} placeholder={placeholder} rows={2} /></div>}</div>;
}

export default function Governance() {
  const [input, setInput] = useState(initial);
  const scores = useMemo(() => calculate(input), [input]);
  const set = <K extends keyof GovernanceInput>(key: K, next: GovernanceInput[K]) => setInput((current) => ({ ...current, [key]: next }));
  return (
    <EsgLayout chapter="governance" eyebrow="校務管治" title="校務管治指數" description="以架構、誠信、資訊透明與風險管理為軸，整理學校的決策與問責制度，建立可回顧的治理紀錄。" image="/manus-storage/esg-governance_d684a5bd.jpg">
      <div className="my-6 border-y border-[#173D35]/10 py-4" data-calculated-score={Math.round(scores.total)}><p className="text-xs font-bold tracking-[0.14em] text-[#273C73]">管治總覽</p><p className="mt-1 text-sm text-[#68756E]">請按校務文件、會議紀錄、相關政策及年度紀錄填寫；勾選項目亦請補充具體實行做法。</p></div>
      <div className="space-y-6">
        <SectionCard code="一 · 校董會" title="校董會架構與治理" description="檢視校董會席位是否完整、專業背景是否多元，以及校董能否持續接受管治培訓。" tone="blue"><div className="grid gap-4 lg:grid-cols-3"><NumberField label="目前空缺席位數量" helper="請檢視六類校董席位是否齊全：辦學團體、校長、教師、家長、校友及獨立校董；填寫尚未填補的席位數量。" value={input.missing} onChange={(v) => set("missing", v)} max={6} suffix="席" /><SelectField label="校董專業背景多元性" helper="按已涵蓋的專業領域類別選擇，例如法律、財務／會計、教育、醫療或社工。" value={input.diversity} onChange={(v) => set("diversity", v)} options={[{ value: "30", label: "涵蓋三種或以上專業類別" }, { value: "20", label: "涵蓋兩種專業類別" }, { value: "10", label: "涵蓋一種或無特別背景" }]} /><NumberField label="校董平均培訓時數" helper="填寫每名校董於本學年參與管治、教育法規、財務或風險管理培訓的平均時數。" value={input.boardTraining} onChange={(v) => set("boardTraining", v)} suffix="小時" /></div></SectionCard>
        <SectionCard code="二 · 誠信" title="廉潔誠信與採購管理" description="以採購合規、利益申報、防貪教育與安全舉報渠道，辨識制度是否足以支持廉潔校務。" tone="blue"><div className="grid gap-4 lg:grid-cols-3"><NumberField label="沒有嚴格按照規例的採購宗數" helper="採購紀錄合規性：請按本學年沒有嚴格遵循廉政公署《學校防貪指南》所列報價與招標門檻的採購宗數填寫。" value={input.procurementIssues} onChange={(v) => set("procurementIssues", v)} suffix="宗" /><NumberField label="利益申報表簽署率" helper="盤點招標委員會成員及採購人員中，已按時完成利益申報表簽署的人數百分比。" value={input.declarationRate} onChange={(v) => set("declarationRate", v)} max={100} suffix="%" /><FieldSet title="防貪機制與舉報" description="勾選已推行的制度，並記錄相關渠道或活動的具體安排。"><div className="grid gap-3"><DescribedCheck label="設有機密申訴渠道" detail="讓教職員、家長或持份者可安全地反映貪污、利益衝突或採購疑慮。" checked={input.reportChannel} onCheckedChange={(v) => set("reportChannel", v)} descriptionLabel="申訴渠道說明" description={input.reportChannelDetail} onDescriptionChange={(v) => set("reportChannelDetail", v)} placeholder="例如：設立保密電郵及專責聯絡人，並於員工手冊列明跟進程序。" /><DescribedCheck label="舉辦年度防貪講座或培訓" detail="可包括由廉政公署、辦學團體或校內管理層安排的防貪教育。" checked={input.icacTalk} onCheckedChange={(v) => set("icacTalk", v)} descriptionLabel="防貪活動說明" description={input.icacTalkDetail} onDescriptionChange={(v) => set("icacTalkDetail", v)} placeholder="例如：安排校董及行政人員參與防貪講座，講解採購與利益衝突處理。" /></div></FieldSet></div></SectionCard>
        <SectionCard code="三 · 透明度" title="資訊透明度與持份者溝通" description="以公開資訊、家校參與和投訴處理制度，衡量溝通機制的可見度與回應性。" tone="blue"><div className="grid gap-4 lg:grid-cols-3"><FieldSet title="資訊公開" description="勾選已向公眾或主要持份者公開的校務文件，並說明查閱方式。"><div className="grid gap-3"><DescribedCheck label="公開《周年學校報告》" detail="讓家長及公眾了解學校的年度工作、成效和主要發展。" checked={input.annualReport} onCheckedChange={(v) => set("annualReport", v)} descriptionLabel="報告公開說明" description={input.annualReportDetail} onDescriptionChange={(v) => set("annualReportDetail", v)} placeholder="例如：已上載學校網頁，並於家長通告附上連結。" /><DescribedCheck label="公開《學校發展計劃》" detail="讓持份者了解學校中長期發展方向及主要策略。" checked={input.developmentPlan} onCheckedChange={(v) => set("developmentPlan", v)} descriptionLabel="計劃公開說明" description={input.developmentPlanDetail} onDescriptionChange={(v) => set("developmentPlanDetail", v)} placeholder="例如：已於學校網頁的「學校資料」頁面提供下載版本。" /></div></FieldSet><FieldSet title="家長與學生參與" description="記錄家長教師會及學生會的實際參與與會議紀錄。"><DescribedCheck label="家長教師會及學生會每學年各自開會四次或以上並留有紀錄" detail="會議應有議程、出席紀錄或會議紀要可供核實。" checked={input.ptaSu} onCheckedChange={(v) => set("ptaSu", v)} descriptionLabel="參與紀錄說明" description={input.ptaSuDetail} onDescriptionChange={(v) => set("ptaSuDetail", v)} placeholder="例如：兩會均按季開會，會議紀錄已存放於校務檔案。" /></FieldSet><FieldSet title="投訴處理機制" description="說明學校如何讓持份者了解投訴渠道、處理時限及跟進程序。"><div className="grid gap-3"><DescribedCheck label="公佈申訴程序" detail="程序應涵蓋接收、調查、回覆、上訴及保密安排。" checked={input.complaintSop} onCheckedChange={(v) => set("complaintSop", v)} descriptionLabel="申訴程序說明" description={input.complaintSopDetail} onDescriptionChange={(v) => set("complaintSopDetail", v)} placeholder="例如：程序已載於學校網頁及家長手冊，並列明指定聯絡人。" /><NumberField label="逾期處理個案" helper="填寫未能在校內既定回覆時限內完成處理的投訴或申訴個案宗數。" value={input.overdue} onChange={(v) => set("overdue", v)} suffix="宗" /></div></FieldSet></div></SectionCard>
        <SectionCard code="四 · 保障" title="風險管理、私隱與兒童保護" description="記錄保護學生資料、人員查核與網絡韌性的校本措施，建立可回顧的保障基線。" tone="blue"><div className="grid gap-4 lg:grid-cols-3"><FieldSet title="新入職及外判服務人員性罪行紀錄查核" description="請按本學年新入職教職員及外判服務人員（例如教練、社工）的實際查核狀態填寫人數。"><div className="grid gap-3"><NumberField label="已完成性罪行紀錄查核人員數" helper="已獲得性罪行紀錄查核結果的新入職教職員及外判服務人員人數。" value={input.scrcChecked} onChange={(v) => set("scrcChecked", v)} suffix="人" /><NumberField label="未完成查核但已承諾申請查核人員數" helper="尚未獲得查核結果，但已承諾並將會申請查核的人員數。" value={input.scrcPending} onChange={(v) => set("scrcPending", v)} suffix="人" /><NumberField label="未完成查核並且沒有承諾申請查核人員數" helper="尚未獲得查核結果，且沒有承諾將會申請查核的人員數。" value={input.scrcNoPlan} onChange={(v) => set("scrcNoPlan", v)} suffix="人" /></div></FieldSet><TextAreaField label="私隱保護措施說明" helper="請描述個人資料、學生成績、醫療紀錄及資料存取管理的實際安排，供後續評核使用。" value={input.privacyDetail} onChange={(v) => set("privacyDetail", v)} placeholder="例如：訂立資料存取權限、定期刪除過期文件及安排私隱培訓。" rows={3} /><TextAreaField label="網絡安全與備份措施說明" helper="請描述備份、防火牆、帳戶管理、更新及資料外洩應變措施，供後續評核使用。" value={input.cyberDetail} onChange={(v) => set("cyberDetail", v)} placeholder="例如：每日自動備份、啟用雙重驗證及定期進行系統更新。" rows={3} /></div></SectionCard>
      </div>
      <SubmissionActions section="governance" data={{ input }} />
    </EsgLayout>
  );
}
