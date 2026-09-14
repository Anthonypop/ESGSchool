import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSubmissionForAdmin, listSubmissionsForAdmin, listSubmissionsForOwner, saveSubmissionSection, submitEsgSubmission, updateSubmissionReview } from "./db";
import { adminProcedure, protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { getSubmissionIssues } from "./submissionRules";

const profileSchema = z.object({ schoolName: z.string().trim().min(1, "請填寫學校名稱。"), reportYear: z.string().trim().min(1, "請填寫報告年度。") }).passthrough();
const sectionSchema = z.enum(["environment", "social", "governance"]);

function safeFilename(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "esg-review-report";
}

export const esgRouter = router({
  saveSection: protectedProcedure.input(z.object({ section: sectionSchema, profile: profileSchema, data: z.record(z.string(), z.unknown()) })).mutation(async ({ ctx, input }) => {
    const submission = await saveSubmissionSection(ctx.user.id, input.profile.reportYear, input.profile, input.section, input.data);
    return submission;
  }),
  mine: protectedProcedure.query(({ ctx }) => listSubmissionsForOwner(ctx.user.id)),
  submit: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const drafts = await listSubmissionsForOwner(ctx.user.id);
    const draft = drafts.find((item) => item.id === input.id);
    if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "找不到可提交的填報資料。" });
    if (draft.status !== "draft") throw new TRPCError({ code: "CONFLICT", message: "此年度資料已提交，不能重複提交。" });
    const issues = getSubmissionIssues(draft);
    if (issues.length) throw new TRPCError({ code: "BAD_REQUEST", message: `請先完成以下資料才可提交：${issues.join("、")}。` });
    const submission = await submitEsgSubmission(ctx.user.id, input.id);
    if (!submission) throw new TRPCError({ code: "NOT_FOUND", message: "找不到可提交的填報資料。" });
    await notifyOwner({ title: "收到新的學校 ESG 提交", content: `${submission.schoolName} 已提交 ${submission.reportYear} 年度 ESG 資料，請前往管理端審閱。` }).catch(() => false);
    return submission;
  }),
  adminList: adminProcedure.query(() => listSubmissionsForAdmin()),
  adminGet: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
    const submission = await getSubmissionForAdmin(input.id);
    if (!submission) throw new TRPCError({ code: "NOT_FOUND", message: "找不到該提交資料。" });
    return submission;
  }),
  adminRespond: adminProcedure.input(z.object({ id: z.number().int().positive(), reviewNote: z.string().trim().min(1, "請填寫回覆內容。"), fileName: z.string().max(255).optional(), fileDataUrl: z.string().max(28_000_000).optional(), fileMimeType: z.string().max(120).optional() })).mutation(async ({ input }) => {
    let reportFileName: string | undefined;
    let reportFileUrl: string | undefined;
    if (input.fileDataUrl) {
      if (!input.fileName || !input.fileMimeType) throw new TRPCError({ code: "BAD_REQUEST", message: "報告檔案資料不完整。" });
      const encoded = input.fileDataUrl.replace(/^data:[^;]+;base64,/, "");
      const bytes = Buffer.from(encoded, "base64");
      if (bytes.length > 20 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "報告檔案不可超過 20MB。" });
      reportFileName = input.fileName;
      const upload = await storagePut(`esg-reports/submission-${input.id}/${safeFilename(input.fileName)}`, bytes, input.fileMimeType);
      reportFileUrl = upload.url;
    }
    return updateSubmissionReview(input.id, { status: "responded", reviewNote: input.reviewNote, ...(reportFileName ? { reportFileName, reportFileUrl } : {}) });
  }),
  adminMarkReviewing: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => updateSubmissionReview(input.id, { status: "reviewing", reviewNote: "" })),
});
