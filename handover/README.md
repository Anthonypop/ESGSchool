# 學校 ESG 指數：技術及平台交接手冊

**文件版本：** 2026-09-10  
**交接基準版本：** `7ccfe25b`  
**專案名稱：** `school-esg-index`

## 1. 交接範圍

本專案是一個供香港學校填報環境、社會及管治資料的平台。學校可以建立自設帳戶，以密碼登入，分別填寫 E、S、G 三章資料，保存草稿後正式提交；平台管理員可以查看提交、標記審閱、撰寫回覆及附上報告檔案。

目前交接應分開處理四個層面：程式碼、執行環境、資料庫與檔案儲存。Git repository 或 ZIP 只代表程式碼，不代表現有資料庫、Secrets、網域、部署帳戶或學校提交資料。

## 2. 技術架構

| 層面 | 實作 |
|---|---|
| 前端 | React 19、Vite、Tailwind CSS 4、Wouter |
| 後端 | Node.js、Express、tRPC |
| 型別及驗證 | TypeScript、Zod、Vitest |
| 資料庫 | MySQL／TiDB、Drizzle ORM |
| 身份驗證 | 自設學校電郵及密碼；scrypt 雜湊；HTTP-only JWT session cookie |
| 檔案儲存 | 目前使用 Manus WebDev 的 storage proxy／S3-backed storage |
| 主要業務資料 | `users` 及 `esgSubmissions` |
| 目前交接版本 | `7ccfe25b` |

## 3. 本機執行

需要 Node.js、pnpm 10、可連線的 MySQL／TiDB 資料庫，以及下列環境變數。請先複製 `.env.example` 或參閱 `ENVIRONMENT.md`，再由安全的 Secret 管理工具注入真正值；不要把 `.env` 加入 Git。

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev
```

開發伺服器使用環境變數 `PORT`；不要在程式碼中固定部署用 port。正式執行方式為：

```bash
pnpm build
NODE_ENV=production pnpm start
```

`pnpm check` 是 TypeScript 檢查，`pnpm test` 目前涵蓋登入、session、ESG 草稿、完整性提交及管理員流程，`pnpm build` 則驗證前端及後端可產生正式輸出。

## 4. 使用流程

學校註冊後取得 `user` 角色。學校可以在 E、S、G 頁面填寫資料，使用共用學校基本資料，保存每一章草稿，並在完整性檢查通過後正式提交。正式提交後，該年度資料不可再由學校修改；管理員可以查看提交並更新至 `reviewing` 或 `responded`，也可以保存回覆摘要及報告檔案連結。

管理員權限不是由前端按鈕決定，而是由資料庫 `users.role` 的 `admin` 值控制。管理員帳戶應透過受控的資料庫管理流程建立或提升，不應開放一般使用者自行註冊成為管理員。

## 5. 重要程式位置

| 功能 | 主要位置 |
|---|---|
| 頁面及路由 | `client/src/App.tsx`、`client/src/pages/` |
| 共用學校資料 | `client/src/contexts/SchoolProfileContext.tsx` |
| E／S／G 填報 | `client/src/pages/Environment.tsx`、`Social.tsx`、`Governance.tsx` |
| 學校帳戶中心 | `client/src/pages/Portal.tsx` |
| 管理員審閱 | `client/src/pages/AdminReview.tsx` |
| tRPC API | `server/routers.ts`、`server/esg.ts` |
| 資料庫存取 | `server/db.ts` |
| 帳戶及 session | `server/localAuth.ts` |
| 資料表定義 | `drizzle/schema.ts` |
| migration | `drizzle/*.sql` |
| 檔案儲存 | `server/storage.ts` |
| 流程測試 | `server/*.test.ts` |

## 6. 交接安全規則

交接包不得包含真正的資料庫連線字串、JWT secret、Forge API key、OAuth secret、管理員密碼或任何 `.env` 檔案。下一手應獲得自己的 GitHub／部署帳戶，而不是共用原持有人的 Manus 登入資料。

正式交接完成後，原持有人應輪換管理員密碼、`JWT_SECRET`、資料庫密碼、外部 API key 及任何可產生登入 session 的憑證。若保留現有部署，應另外確認 Manus 專案、網域、資料庫、storage 及 Secrets 的擁有權；這些資料不會因下載 ZIP 而自動轉移。

## 7. 建議交接順序

先以本文件所列的 checkpoint 建立一份只讀基準，然後交付 GitHub repository 或 ZIP。下一手在自己的環境執行 `pnpm install`、`pnpm check`、`pnpm test` 及 `pnpm build`，確認程式碼可重建。之後才進行資料庫備份還原、Secrets 注入、測試帳戶驗證及網域切換。最後才撤銷舊維護者權限和輪換所有憑證。

## 8. 驗收標準

交接完成時，下一手應能在自己的環境啟動網站，學校可以註冊、登入、保存 E／S／G 草稿並正式提交，管理員可以查看及回覆提交，報告檔案可以正常上載或下載，所有測試及正式建置均通過，而且不需要使用原持有人的 Manus 登入資料。

