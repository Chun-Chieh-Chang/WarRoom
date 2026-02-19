# 開發紀錄 (DEV_LOG)

## 政策

- **紀錄**：所有的失敗、根本原因分析與矯正措施必須紀錄於此。
- **同步**：上下文與代碼同等重要。開發過程中需即時更新，而不僅僅是完成後。
- **語言憲法**：系統內外所有輸出（UI、AI 回覆、日誌）必須嚴格使用**繁體中文**，絕對禁止出現簡體字。簡體字出現被視為嚴重的「系統污染」。

## 日誌分錄

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
