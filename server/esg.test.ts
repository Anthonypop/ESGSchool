import { describe, expect, it } from "vitest";
import { getSubmissionIssues } from "./submissionRules";

function scrcResult(completed: number, pending: number, noCommitment: number) {
  const total = completed + pending + noCommitment;
  return total === 0 ? 0 : noCommitment > 0 ? 0 : pending > 0 ? 20 : completed === total ? 40 : 0;
}

describe("性罪行紀錄查核規則", () => {
  it("所有人員完成查核時回傳 40 分", () => expect(scrcResult(5, 0, 0)).toBe(40));
  it("有承諾申請但未完成的人員時回傳 20 分", () => expect(scrcResult(4, 1, 0)).toBe(20));
  it("有未承諾申請的人員時回傳 0 分", () => expect(scrcResult(4, 0, 1)).toBe(0));
});

describe("ESG 正式提交完整性", () => {
  it("會識別尚未保存的章節及缺少的基本資料", () => {
    expect(getSubmissionIssues({ profileData: { schoolName: "", reportYear: "2025/2026" }, environmentData: {}, socialData: null, governanceData: null })).toEqual(expect.arrayContaining(["學校名稱", "總樓面面積", "全校學生人數", "全職教職員人數", "社會章節", "管治章節"]));
  });
  it("完整的三章資料及基本資料可以提交", () => {
    expect(getSubmissionIssues({ profileData: { schoolName: "示範中學", reportYear: "2025/2026", grossFloorArea: 1000, studentCount: 600, staffCount: 50 }, environmentData: {}, socialData: {}, governanceData: {} })).toEqual([]);
  });
});
