import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createLocalSchoolUser: vi.fn(), getUserByEmail: vi.fn(), touchLocalUserSignIn: vi.fn(),
  saveSubmissionSection: vi.fn(), listSubmissionsForOwner: vi.fn(), submitEsgSubmission: vi.fn(),
  listSubmissionsForAdmin: vi.fn(), getSubmissionForAdmin: vi.fn(), updateSubmissionReview: vi.fn(),
  hashPassword: vi.fn(), verifyPassword: vi.fn(), normaliseEmail: vi.fn(), setLocalSession: vi.fn(), clearLocalSession: vi.fn(),
  storagePut: vi.fn(), notifyOwner: vi.fn(),
}));

vi.mock("./db", () => ({
  createLocalSchoolUser: mocks.createLocalSchoolUser, getUserByEmail: mocks.getUserByEmail, touchLocalUserSignIn: mocks.touchLocalUserSignIn,
  saveSubmissionSection: mocks.saveSubmissionSection, listSubmissionsForOwner: mocks.listSubmissionsForOwner, submitEsgSubmission: mocks.submitEsgSubmission,
  listSubmissionsForAdmin: mocks.listSubmissionsForAdmin, getSubmissionForAdmin: mocks.getSubmissionForAdmin, updateSubmissionReview: mocks.updateSubmissionReview,
}));
vi.mock("./localAuth", () => ({ hashPassword: mocks.hashPassword, verifyPassword: mocks.verifyPassword, normaliseEmail: mocks.normaliseEmail, setLocalSession: mocks.setLocalSession, clearLocalSession: mocks.clearLocalSession, LOCAL_SESSION_COOKIE: "school_esg_session" }));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));
vi.mock("./_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));

const { appRouter } = await import("./routers");

const schoolUser = { id: 7, openId: "local:school", name: "示範中學", email: "school@example.edu.hk", passwordHash: "hash", loginMethod: "school-password", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const adminUser = { ...schoolUser, id: 1, openId: "local:admin", role: "admin" as const };
const completeDraft = { id: 15, ownerId: 7, schoolName: "示範中學", reportYear: "2025/2026", profileData: { schoolName: "示範中學", reportYear: "2025/2026", grossFloorArea: 1000, studentCount: 600, staffCount: 50 }, environmentData: {}, socialData: {}, governanceData: {}, status: "draft" as const, submittedAt: null, reviewNote: null, reportFileName: null, reportFileUrl: null, createdAt: new Date(), updatedAt: new Date() };

function context(user: typeof schoolUser | typeof adminUser | null): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { cookie: vi.fn(), clearCookie: vi.fn() } as TrpcContext["res"] };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.normaliseEmail.mockImplementation((email: string) => email.trim().toLowerCase());
  mocks.hashPassword.mockResolvedValue("hashed-password"); mocks.verifyPassword.mockResolvedValue(true);
  mocks.createLocalSchoolUser.mockResolvedValue(schoolUser); mocks.getUserByEmail.mockResolvedValue(undefined);
  mocks.saveSubmissionSection.mockResolvedValue(completeDraft); mocks.listSubmissionsForOwner.mockResolvedValue([completeDraft]); mocks.submitEsgSubmission.mockResolvedValue({ ...completeDraft, status: "submitted" });
  mocks.getSubmissionForAdmin.mockResolvedValue(completeDraft); mocks.updateSubmissionReview.mockResolvedValue({ ...completeDraft, status: "responded" }); mocks.storagePut.mockResolvedValue({ key: "esg-reports/submission-15/report.pdf", url: "https://reports.example/report.pdf" }); mocks.notifyOwner.mockResolvedValue(true);
});

describe("學校自設帳戶與 ESG 流程", () => {
  it("可註冊並建立安全工作階段", async () => {
    const caller = appRouter.createCaller(context(null));
    const result = await caller.account.register({ schoolName: "示範中學", email: " School@Example.edu.hk ", password: "long-school-password" });
    expect(result).toEqual(schoolUser);
    expect(mocks.createLocalSchoolUser).toHaveBeenCalledWith({ schoolName: "示範中學", email: "school@example.edu.hk", passwordHash: "hashed-password" });
    expect(mocks.setLocalSession).toHaveBeenCalledWith(expect.anything(), expect.anything(), schoolUser.id);
  });
  it("可登入、儲存三章資料並在完整時正式提交", async () => {
    mocks.getUserByEmail.mockResolvedValue(schoolUser);
    const caller = appRouter.createCaller(context(schoolUser));
    await caller.account.login({ email: "school@example.edu.hk", password: "long-school-password" });
    await caller.esg.saveSection({ section: "environment", profile: completeDraft.profileData, data: { electricity: 1 } });
    const result = await caller.esg.submit({ id: completeDraft.id });
    expect(mocks.touchLocalUserSignIn).toHaveBeenCalledWith(schoolUser.id);
    expect(mocks.saveSubmissionSection).toHaveBeenCalledWith(schoolUser.id, "2025/2026", completeDraft.profileData, "environment", { electricity: 1 });
    expect(mocks.submitEsgSubmission).toHaveBeenCalledWith(schoolUser.id, completeDraft.id);
    expect(result.status).toBe("submitted");
    expect(mocks.notifyOwner).toHaveBeenCalled();
  });
  it("會拒絕缺少任何 ESG 章節的正式提交", async () => {
    mocks.listSubmissionsForOwner.mockResolvedValue([{ ...completeDraft, socialData: null }]);
    const caller = appRouter.createCaller(context(schoolUser));
    await expect(caller.esg.submit({ id: completeDraft.id })).rejects.toMatchObject({ message: expect.stringContaining("社會章節") });
    expect(mocks.submitEsgSubmission).not.toHaveBeenCalled();
  });
  it("可由管理員發送回覆摘要", async () => {
    const caller = appRouter.createCaller(context(adminUser));
    const result = await caller.esg.adminRespond({ id: completeDraft.id, reviewNote: "已完成初步審閱。" });
    expect(mocks.updateSubmissionReview).toHaveBeenCalledWith(completeDraft.id, expect.objectContaining({ status: "responded", reviewNote: "已完成初步審閱。" }));
    expect(result.status).toBe("responded");
  });
  it("可由管理端上載回覆報告，並讓學校帳戶取得下載連結", async () => {
    const responded = { ...completeDraft, status: "responded" as const, reviewNote: "請參閱附件報告。", reportFileName: "report.pdf", reportFileUrl: "https://reports.example/report.pdf" };
    mocks.updateSubmissionReview.mockResolvedValue(responded); mocks.listSubmissionsForOwner.mockResolvedValue([responded]);
    const adminCaller = appRouter.createCaller(context(adminUser));
    await adminCaller.esg.adminRespond({ id: completeDraft.id, reviewNote: "請參閱附件報告。", fileName: "report.pdf", fileMimeType: "application/pdf", fileDataUrl: "data:application/pdf;base64,cmVwb3J0" });
    expect(mocks.storagePut).toHaveBeenCalledWith("esg-reports/submission-15/report.pdf", expect.any(Buffer), "application/pdf");
    expect(mocks.updateSubmissionReview).toHaveBeenCalledWith(completeDraft.id, expect.objectContaining({ status: "responded", reportFileName: "report.pdf", reportFileUrl: "https://reports.example/report.pdf" }));
    const schoolCaller = appRouter.createCaller(context(schoolUser));
    await expect(schoolCaller.esg.mine()).resolves.toEqual([responded]);
  });
});
