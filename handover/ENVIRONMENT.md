# 執行環境及 Secrets 交接說明

本文件只列出變數名稱和用途，**不包含任何真實值**。真正值應在新維護者自己的部署平台、Secret manager 或受控環境設定中建立。

## 必要變數

| 變數 | 用途 | 是否敏感 | 交接方式 |
|---|---|---:|---|
| `DATABASE_URL` | MySQL／TiDB 連線 | 是 | 建立新資料庫使用者及新連線字串 |
| `JWT_SECRET` | 簽署本地登入 session | 是 | 產生全新的長隨機值；輪換後舊 session 失效 |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API 基礎網址 | 否／依環境 | 若留在 Manus，使用新專案的設定 |
| `BUILT_IN_FORGE_API_KEY` | storage、通知及其他 built-in API 憑證 | 是 | 不要從舊 `.env` 複製；重新建立或由平台注入 |
| `VITE_APP_ID` | 若保留 OAuth／平台整合時使用 | 依環境 | 新部署按實際登入方案設定 |
| `VITE_OAUTH_PORTAL_URL` | OAuth 前端入口；目前本地學校帳戶流程未以此作主要登入 | 否 | 只有保留 OAuth 時才需要 |
| `OAUTH_SERVER_URL` | OAuth 後端服務網址 | 否／依環境 | 只有保留 OAuth 時才需要 |
| `OWNER_OPEN_ID` | 平台擁有人識別 | 依環境 | 新平台按管理權限方案設定 |
| `OWNER_NAME` | 平台擁有人顯示名稱 | 否 | 新部署自行設定 |
| `VITE_FRONTEND_FORGE_API_URL` | 前端 built-in API／地圖 proxy 網址 | 否／依環境 | 若使用地圖元件，按新環境設定 |
| `VITE_FRONTEND_FORGE_API_KEY` | 前端 proxy 使用的公開環境設定 | 是／依平台 | 由部署平台注入，不寫入程式碼 |
| `VITE_ANALYTICS_ENDPOINT` | Umami 或分析服務 endpoint | 否／依環境 | 可停用或改為新分析服務 |
| `VITE_ANALYTICS_WEBSITE_ID` | 分析網站識別碼 | 否 | 改用新網站識別碼 |
| `OPENAI_API_KEY` | 只有啟用相關 LLM 功能時需要 | 是 | 目前 ESG 核心流程不應依賴此值；若未使用可不設定 |

## 交接時不可做的事情

不可將 `.env`、`.env.local`、資料庫連線字串、管理員密碼、`JWT_SECRET` 或任何 API key 上傳 GitHub、放進 ZIP、貼在聊天訊息或寫入 README。`.gitignore` 已排除主要 `.env` 檔案，但交接前仍應檢查 Git history 及 ZIP 內容。

## 建立新環境的建議程序

新維護者應先建立新的資料庫使用者、storage／API 憑證和部署專案，再把變數逐一注入。注入後執行：

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

如需資料庫 migration，先確認目標資料庫為備份還原後的正確環境，再按 migration 順序執行，不要直接在生產資料庫試驗破壞性 SQL。`drizzle/schema.ts` 與 `drizzle/*.sql` 必須保持一致。

## 憑證輪換清單

交接驗收完成後，原持有人應撤銷或輪換舊管理員密碼、舊資料庫密碼、舊 `JWT_SECRET`、Forge／storage key、OAuth 憑證、分析服務管理 token，以及任何曾在開發機或聊天中出現的測試憑證。輪換 `JWT_SECRET` 會令現有登入 session 失效，應提前通知仍在填報的學校。

