# 開發紀錄 (DEV_LOG)

## 政策

- **紀錄**：所有的失敗、根本原因分析與矯正措施必須紀錄於此。
- **同步**：上下文與代碼同等重要。開發過程中需即時更新，而不僅僅是完成後。
- **語言憲法**：系統內外所有輸出（UI、AI 回覆、日誌）必須嚴格使用**繁體中文**，絕對禁止出現簡體字。簡體字出現被視為嚴重的「系統污染」。

- **結構安全 (Structural Safeguard)**：在修改 HTML 結構（特別是涉及 Flex/Grid 佈局的容器）之前，必須確保標記配對 (Opening/Closing Tags) 完全正確。任何未閉合的標籤都可能導致 CSS 引擎解析錯誤，進而引發整體的佈局塌陷。

## 日誌分錄

### [2026-02-21] 佈局塌陷異常與 DOM 結構修復 (UI Layout Collapse Fix)

- **問題**：UI 介面發生嚴重異常，所有內容被壓縮至螢幕極右側，左側出現巨大黑洞。
- **根本原因**：
  1. 在 `header` 區域進行 UI 增補時，遺漏了閉合 `<div>` 標籤，導致 `dashboard-container` 被瀏覽器判定為 `header` 的子元素。
  2. 由於 `header` 採用 Flex 佈局並設置了右對齊/底對齊屬性，導致所有被「吞噬」的組件隨之塌陷。
- **矯正措施**：
  1. 重新審查並修正 `index.html` 中的 HTML 層級結構，確保 `header` 區域與主內容區域 (`dashboard-container`) 物理隔離。
  2. 在 `body` 中加入強制的 `align-items: center`，並為主要容器補齊 `margin: 0 auto` 與 `box-sizing: border-box`，提升佈局的魯棒性。
  3. 實作「硬體感知徽章」與「雲地辨識圖示」，提升環境狀態的透明度。
- **成果**：恢復專業、對稱的戰略視野，並建立了針對 HTML 結構安全的開發守則。

### [2026-02-19] 專案初始化

- **操作**：建立核心架構與文檔。

### [2026-02-19] 語言憲法與核心原則 (Linguistic Constitution)

- **問題**：AI 回覆中偶爾出現簡體字，系統連線報錯包含簡體描述。
- **根本原因**：AI 模型的預設傾向以及 Prompt 不夠嚴謹，且系統缺乏強制性的語言原則約束。
- **矯正措施**：
  - 更新 `OllamaProvider`、`FlywheelController` 與 `DistillationManager` 的 Prompt，加入嚴格的 `[語言憲法]` 約束。
  - 建立 `src/seed_constitution.ts` 並實作「語言憲法」作為系統飛輪進化時必須遵循的第一原則。
  - 在 `DEV_LOG.md` 中明文化「禁止簡體字」政策。
- **成果**：系統現在會自動將任何輸入轉換為繁體，且所有自我進化的原則都將圍繞繁體中文展開。

### [2026-02-19] 核心引擎與 AI 持久化

- **操作**：實作 SQLite 儲存與 Ollama Chat API。使用 Zod 進行數據校驗。

### [2026-02-19] 智慧決策內閣 (Cabinet V3)

- **操作**：引入多代理博弈決策模式。

### [2026-02-19] 安全與相容性優化 (Security & Compatibility)

- **問題**：瀏覽器報錯 Content Security Policy (CSP) 阻擋 `eval` 使用，且回報棄用功能 (Deprecated features)。
- **根本原因**：外部 CDN 引用版本不明確，且缺乏明確的內容安全策略聲明。
- **矯正措施**：
  - 在 `index.html` 中實作明確的 `Content-Security-Policy` 元標籤，規範腳本與樣式來源。
  - 將 `Chart.js` 鎖定在穩定版 `4.4.1` 並切換至 UMD 構建版，以提升相容性並消除 `eval` 需求。
- **成果**：消除瀏覽器安全警告，提升系統在嚴格安全環境下的穩定性。

### [2026-02-19] 系統大腦重構：FlywheelController (V3 Cabinet Edition)

- **操作**：封裝生命週期，實作審計表。

### [2026-02-19] 非線性爆發：多元資產協同效應 (Synergy V4)

- **操作**：實作 `SynergyManager.ts`。打破資產孤島。

### [2026-02-19] 極限挑戰：黑天鵝與抗脆弱性 (Antifragile V5)

- **操作**：實作 `BlackSwanManager.ts` 注入環境衝擊。升級內閣應變機制。

### [2026-02-19] 元智慧進化：系統憲法與提煉機制 (Constitution V6)

- **目標**：實現智慧從碎片化到原則化的昇華。
- **操作**：
  - 在 SQLite 中實作 `constitution` 表，儲存系統核心原則。
  - 實作 **`DistillationManager.ts`**：定期將原始經驗提煉為 3 條「導向原則」。
  - 升級 `FlywheelController` 為 **Constitutional Edition**：決策內閣現在必須優先遵循「系統憲法」進行辯論。
- **成果**：系統具備了元認知能力。它不再只是單純執行，而是根據歷史自我總結出一套「價值觀」，並依此指導未來的行為，達成了真正意義上的自主增長。

### [2026-02-19] 持續部署與 GitHub Pages 自動化 (CI/CD Setup)

- **目標**：實現自動化部署，降低發布阻力，具體落實飛輪系統中的「自動化」原則。
- **問題**：首次提交時發生 Pre-commit Hook (Husky + Vitest) 失敗。
- **根本原因**：
  1. 系統中存在由 Plop 模板生成的佔位檔案 `ReputationAsset.ts` 與 `ReputationAsset.test.ts`，其內容包含未經替換的 `{{pascalCase name}}` 語法，導致 TypeScript 編譯與測試失敗。
  2. 檔案編碼異常（UTF-16），導致工具鏈讀取錯誤。
- **矯正措施**：
  - 手動清理損壞的模板實例檔案，確保測試環境 (Vitest) 100% 通過。
  - 建立 `.github/workflows/static.yml`，設定 GitHub Actions 自動將 `src/web` 目錄推送至 GitHub Pages。
  - 配置 `.gitignore` 排除 `node_modules`、`dist` 等非原始碼檔案。
- **成果**：
  - 專案成功推送至 GitHub。
  - [戰略大腦會議室 Live Demo](https://Chun-Chieh-Chang.github.io/WarRoom/) 已上線並實現自動化更新。

### [2026-02-20] 靜態環境容錯優化 (Static Environment Resilience)

- **問題**：在 GitHub Pages 上發生 `404 Not Found` 引發的 JSON 解析錯誤 (`Unexpected token '<'`)。
- **根本原因**：靜態託管環境缺乏後端 API，前端 `fetch` 抓取到 404 HTML 頁面並嘗試解析為 JSON。
- **矯正措施**：
  - 在 `index.html` 的 `loadTeam` 與 `loadHistory` 中加入 `res.ok` 與 `content-type` 檢查。
  - 實作「優雅降級」：當 API 不可用時，自動切換至前端預設的 AI 角色配置，不中斷 UI 渲染。
- **成果**：消除 Live Demo 的 Console 錯誤，確保跨環境（本地 vs 靜態託管）的穩定性。

### [2026-02-20] 專案結構清理 (Project Cleanup & MECE Alignment)

- **目標**：遵循 MECE 原則整理檔案結構，消除冗餘檔案（Anti-bloat）。
- **操作**：
  - 移除根目錄冗餘檔案：`temp_index.html`、`debug_db.js`。
  - 清理 `src/` 目錄：移除原型階段之模擬腳本 (`ai_simulation.ts` 等)，使核心源碼更專注於生產環境。
- **成果**：專案結構更清晰，降低後續開發的認知負荷。

### [2026-02-21] 智慧決策深化與視覺化優化 (Structured Intelligence & Monitoring)

- **目標**：提升 AI 討論的專業深度，並強化系統進展的透明度。
- **操作**：
  - **結構化分析**：在 `BrainstormingController` 中引入 `AnalysisMode`，整合 SWOT、PESTEL 與抗脆弱分析。
  - **進度追蹤器**：實作「飛輪動能進度條」(Flywheel Momentum Bar)，即時呈現決策收斂進度。
  - **效能索引**：為 SQLite 資料庫補足 `experience`、`actions` 與 `constitution` 表之索引。
- **成果**：達成視學化的「複利積累」體感，並確保長期運行效能。

### [2026-02-21] 元智慧資產化與自主進化 (Meta-Knowledge Assetization)

- **目標**：讓系統的「自我學習」能力從隱形轉為顯性，強化智慧資產的保存。
- **操作**：
  - **系統憲法看板**：新增「系統智慧憲法」UI 卡片，即時串接資料庫中的元原則 (Meta-Principles)。
  - **自主進化接口**：實作 `POST /api/distill` 與前端 `[EVOLVE]` 按鈕，允許手動觸發智慧提煉。
  - **控制中心佈局重構**：遵循 MECE 原則優化 UI 導覽結構，將功能模組化分類。
- **成果**：
  - 系統正式具備了「可見」的價值觀進化路徑。
  - 使用者能主動推動系統的知識昇華，實現了「使用者互動」與「智慧增長」的深度閉環。
