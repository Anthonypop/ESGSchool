export type SubmissionForValidation = {
  profileData: Record<string, unknown> | null;
  environmentData: Record<string, unknown> | null;
  socialData: Record<string, unknown> | null;
  governanceData: Record<string, unknown> | null;
};

function hasNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

export function getSubmissionIssues(submission: SubmissionForValidation) {
  const issues: string[] = [];
  const profile = submission.profileData || {};
  if (!hasNonEmptyString(profile.schoolName)) issues.push("學校名稱");
  if (!hasNonEmptyString(profile.reportYear)) issues.push("報告年度");
  if (!hasFiniteNumber(profile.grossFloorArea)) issues.push("總樓面面積");
  if (!hasFiniteNumber(profile.studentCount)) issues.push("全校學生人數");
  if (!hasFiniteNumber(profile.staffCount)) issues.push("全職教職員人數");
  if (!submission.environmentData) issues.push("環境章節");
  if (!submission.socialData) issues.push("社會章節");
  if (!submission.governanceData) issues.push("管治章節");
  return issues;
}
