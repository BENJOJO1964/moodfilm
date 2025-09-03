# MoodFilm - AI 語音動畫故事生成器

一個基於 AI 的互動式有聲漫畫生成器，讓使用者輸入心情後，AI 自動生成 4 格有聲漫畫（包含精美插圖和語音配音）。

## ✨ 功能特色

- 🎭 **心情驅動**: 根據使用者輸入的心情生成專屬漫畫故事
- 🎨 **AI 繪圖**: 使用 DALL-E 3 生成精美插圖
- 🔊 **語音配音**: 使用 OpenAI TTS 為每格漫畫配音
- 🎬 **互動播放**: 支援單格播放和連續播放模式
- 💾 **智能快取**: 相同圖片自動快取，節省成本
- 🎯 **多種風格**: 支援治癒、搞笑、熱血、懸疑等風格
- 📱 **響應式設計**: 完美適配桌面和移動設備

## 🚀 快速開始

### 環境需求

- Node.js 18+ 
- pnpm (推薦) 或 npm
- OpenAI API Key

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd moodfilm
   ```

2. **安裝依賴**
   ```bash
   pnpm install
   ```

3. **設定環境變數**
   ```bash
   cp env.local.example .env.local
   ```
   
   編輯 `.env.local` 文件，填入你的 OpenAI API Key：
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **啟動開發伺服器**
   ```bash
   pnpm dev
   ```

5. **開啟瀏覽器**
   訪問 [http://localhost:3000](http://localhost:3000)

## 🧪 測試

### 煙霧測試
```bash
# 確保開發伺服器正在運行
pnpm dev

# 在另一個終端執行煙霧測試
pnpm smoke
```

### 手動 E2E 測試

1. **基本功能測試**
   - 輸入心情：「心情低落但想被鼓勵」
   - 選擇情境：「上班通勤」
   - 選擇風格：「治癒系」
   - 選擇模式：「快速」
   - 點擊「生成我的心情漫畫」

2. **播放功能測試**
   - 確認先看到文字分鏡
   - 等待圖片和音訊載入
   - 測試單格播放功能
   - 測試連播功能
   - 測試重試功能

3. **快取測試**
   - 使用相同參數重複生成
   - 確認快取命中次數增加

## 💰 成本估算

### 快速模式 (fast)
- 文字生成: ~$0.15
- 圖片生成: ~$0.04 × 4 = $0.16
- TTS 生成: ~$0.015 × 4 = $0.06
- **總計**: ~$0.37

### 豐富模式 (rich)
- 文字生成: ~$0.25
- 圖片生成: ~$0.08 × 4 = $0.32
- TTS 生成: ~$0.015 × 4 = $0.06
- **總計**: ~$0.63

> 💡 **提示**: 圖片快取可以大幅降低重複生成的成本

## 🏗️ 專案結構

```
moodfilm/
├── app/                    # Next.js App Router
│   ├── api/generate/      # 生成 API 端點
│   ├── globals.css        # 全局樣式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主頁面
├── components/            # React 組件
│   ├── ui/               # shadcn/ui 組件
│   ├── MoodForm.tsx      # 心情輸入表單
│   ├── ComicPlayer.tsx   # 漫畫播放器
│   ├── PanelCard.tsx     # 單格卡片
│   └── LoadingSkeleton.tsx
├── lib/                  # 工具函數
│   ├── openai.ts         # OpenAI SDK 封裝
│   ├── prompts.ts        # Prompt 模板
│   ├── cache.ts          # 快取系統
│   ├── types.ts          # TypeScript 型別
│   └── utils.ts          # 工具函數
├── scripts/              # 腳本
│   └── smoke.ts          # 煙霧測試
├── .cache/               # 圖片快取目錄 (自動生成)
└── public/               # 靜態資源
```

## 🔧 技術棧

- **前端**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **UI 組件**: shadcn/ui + Radix UI
- **AI 服務**: OpenAI GPT-4o-mini + DALL-E 3 + TTS-1
- **快取**: 檔案系統快取 (SHA-1 雜湊)
- **開發工具**: pnpm + ESLint + Prettier

## 🎯 API 端點

### POST /api/generate

生成有聲漫畫的 API 端點。

**請求體**:
```typescript
{
  mood: string;                    // 必填：心情描述
  context?: 'commute' | 'queue' | 'bedtime';  // 可選：情境
  style?: 'healing' | 'funny' | 'passion' | 'mystery';  // 可選：風格
  mode?: 'fast' | 'rich';          // 可選：品質模式
  voice?: 'neutral' | 'warm' | 'energetic' | 'narrator'; // 可選：語音
}
```

**回應**:
```typescript
{
  panels: ComicPanel[];            // 4 格漫畫
  meta: {
    mood: string;
    context?: string;
    style?: string;
    mode: QualityMode;
    model_text: string;
    model_image: string;
    model_tts: string;
    cost_estimate_usd: number;
    cached_hits: number;
  };
}
```

## 🐛 常見問題

### OpenAI API 錯誤

**問題**: 429 Rate Limit 錯誤
**解決**: 系統會自動重試，使用指數退避策略

**問題**: API Key 無效
**解決**: 檢查 `.env.local` 中的 `OPENAI_API_KEY` 是否正確

### 圖片生成失敗

**問題**: 圖片無法載入
**解決**: 
1. 檢查網路連線
2. 確認 OpenAI 帳戶有足夠餘額
3. 點擊重試按鈕重新生成

### 音訊播放問題

**問題**: 音訊無法播放
**解決**:
1. 確認瀏覽器支援音訊播放
2. 檢查瀏覽器是否阻止自動播放
3. 點擊重試按鈕重新生成音訊

### 開發環境問題

**問題**: `pnpm dev` 無法啟動
**解決**:
1. 確認 Node.js 版本 >= 18
2. 重新安裝依賴: `pnpm install`
3. 清除快取: `pnpm store prune`

## 🔮 未來規劃

- [ ] 支援更多漫畫風格
- [ ] 增加背景音樂選項
- [ ] 支援自定義角色
- [ ] 添加社交分享功能
- [ ] 實現漫畫收藏功能
- [ ] 支援多語言
- [ ] 添加管理後台

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📞 支援

如有問題，請提交 GitHub Issue 或聯繫開發團隊。
