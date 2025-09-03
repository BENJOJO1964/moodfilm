// System（故事生成）
export const SYSTEM_STORY = `你是一個前衛、創新、顛覆性的故事大師。

**絕對規則：**
1. 你必須根據用戶輸入的主題生成完全不同的故事
2. 禁止生成任何預設或模板化的故事
3. 每個故事都必須是獨一無二的
4. 故事內容必須100%圍繞用戶的主題

**核心要求：**
- 每格故事必須包含至少一個"WOW時刻"
- 故事要有強烈的視覺衝擊力和情感震撼
- 情節要前衛、大膽、突破常規思維
- 結局要出人意料，讓讀者感到震撼

**故事風格：**
- 超現實主義、魔幻現實主義
- 時空穿越、平行宇宙、量子糾纏
- 反轉、懸疑、驚悚元素
- 強烈的感官刺激和情感衝擊

**嚴格禁止：**
- 使用任何預設故事模板
- 生成與主題無關的內容
- 重複之前生成過的故事
- 偏離用戶輸入的主題

記住：每次生成都必須是全新的、獨特的、與主題完全相關的故事！`;

// User（心情→分鏡）（以 {{mood}}/{{context}}/{{style}} 注入）
export const USER_STORY = (mood: string, style?: string) => {
  // 檢測用戶輸入的語言
  const isChinese = /[\u4e00-\u9fff]/.test(mood);
  
  if (isChinese) {
    return `\n**緊急指令：你必須生成一個全新的、獨特的故事！**\n\n用戶主題: ${mood}\n風格: ${style ?? '治癒'}\n長度: 簡潔\n\n**絕對要求：**\n1. 故事必須100%圍繞"${mood}"這個主題\n2. 禁止使用任何預設故事模板\n3. 禁止生成與主題無關的內容\n4. 每個故事都必須是獨一無二的\n\n**故事主題：${mood}**\n\n${style ? getStyleSpecificPromptChinese(style) : ''}\n\n**故事結構（每格都必須與"${mood}"直接相關）：**\n- 第1格: 展示"${mood}"的初始狀態，必須與主題完全相關\n- 第2格: 關於"${mood}"的震撼轉折，改變一切\n- 第3格: "${mood}"的超現實發展，違反邏輯\n- 第4格: 關於"${mood}"的震撼結局，出人意料\n\n**嚴格要求：**\n- 每格都必須描述"${mood}"相關的內容\n- 視覺提示必須展現"${mood}"的場景\n- 敘述必須重點描述"${mood}"\n- 時長: 每格5-7秒\n\n**絕對禁止：**\n- 偏離"${mood}"主題的任何內容\n- 使用預設故事模板\n- 生成與主題無關的場景\n\n**輸出格式：** JSON格式，包含panels數組，每個包含: index, title, narration, dialogue, visual_prompt, duration_sec\n\n**最後警告：如果你生成與"${mood}"無關的內容，就是失敗！**`;
      } else {
      return `\nUser theme: ${mood}\nStyle: ${style ?? 'healing'}\nLength: concise\n\n**CORE REQUIREMENT: The story MUST be 100% focused on the theme "${mood}"!**\n\nGenerate a MIND-BLOWING 4-panel comic story that will SHOCK, AMAZE, and LEAVE READERS SPEECHLESS.\nCreate a narrative with UNEXPECTED TWISTS, MIND-BENDING REVELATIONS, and SURREAL EXPERIENCES.\n\n${style ? getStyleSpecificPrompt(style) : ''}\n\nStory Structure (MUST include SHOCKING WOW factors, and each panel MUST relate to "${mood}"):\n- Panel 1: Set-up showing the initial state of "${mood}", hinting at something EXTRAORDINARY and potentially DANGEROUS\n- Panel 2: MIND-BLOWING TWIST - A revelation about "${mood}" that changes EVERYTHING\n- Panel 3: SURREAL REVELATION - "${mood}" defying logic and reality\n- Panel 4: SHOCKING CONCLUSION - An ending about "${mood}" that NOBODY saw coming\n\n**CRITICAL REQUIREMENTS:**\n- Each panel MUST have a "WOW moment" directly related to "${mood}"\n- Story MUST be avant-garde and mind-bending, but the theme MUST be "${mood}"\n- Visual prompts MUST be surreal and striking, showcasing scenes of "${mood}"\n- Narration MUST be concise but powerful (max 2 sentences per panel), focusing on "${mood}"\n- Duration: 5-7 seconds per panel\n\n**ABSOLUTELY FORBIDDEN: Any content that deviates from the theme "${mood}"!**\n\nOutput format: JSON with panels array, each containing: index, title, narration, dialogue, visual_prompt, duration_sec.`;
  }
};

// 圖片風格後綴 - 優化為更簡潔的提示詞
export const IMAGE_STYLE_SUFFIX = `, surreal art, avant-garde, striking colors, dramatic lighting, trending on artstation`;

// TTS 文本組合規則（每格）
export const TTS_TEXT = (title: string, narr: string, dialog: string, sfx?: string) =>
  `${title ? title + '. ' : ''}${narr} ${dialog ? ' ' + dialog : ''}${sfx ? ' (Sound cue: ' + sfx + ')' : ''}`;

// 根據風格生成特定的提示詞（英文版）
function getStyleSpecificPrompt(style: string): string {
  const stylePrompts: Record<string, string> = {
    // 原有風格
    'healing': 'Focus on HEALING and THERAPEUTIC elements - create stories that provide comfort, hope, and emotional healing. Include elements of recovery, support, and positive transformation.',
    'funny': 'Focus on HUMOROUS and ENTERTAINING elements - create stories that make readers laugh and feel joy. Include elements of comedy, wit, and lighthearted moments.',
    'passion': 'Focus on PASSIONATE and INTENSE elements - create stories with strong emotions, dramatic conflicts, and powerful motivations. Include elements of desire, conflict, and emotional intensity.',
    'mystery': 'Focus on MYSTERIOUS and ENIGMATIC elements - create stories with hidden secrets, unexplained phenomena, and suspenseful revelations. Include elements of intrigue, puzzles, and mysterious atmospheres.',
    'cute': 'Focus on CUTE and ADORABLE elements - create stories that are sweet, charming, and heartwarming. Include elements of innocence, friendship, and gentle emotions.',
    'dramatic': 'Focus on DRAMATIC and THEATRICAL elements - create stories with intense emotions, conflicts, and powerful storytelling. Include elements of tension, climax, and emotional impact.',
    'whimsical': 'Focus on WHIMSICAL and FANTASY elements - create stories with magical, imaginative, and playful elements. Include elements of wonder, creativity, and magical realism.',
    'elegant': 'Focus on ELEGANT and SOPHISTICATED elements - create stories with refined, cultured, and graceful elements. Include elements of beauty, sophistication, and refined taste.',
    'raw': 'Focus on RAW and AUTHENTIC elements - create stories with honest, unfiltered, and genuine emotions. Include elements of truth, vulnerability, and real human experience.',
    'dreamy': 'Focus on DREAMY and ETHEMERAL elements - create stories with soft, mystical, and otherworldly atmospheres. Include elements of dreams, fantasy, and magical realism.',
    // 原情境選項
    'positive': 'Focus on UPLIFTING and INSPIRING elements - create stories that make readers feel empowered, hopeful, and motivated. Include elements of triumph, growth, and positive transformation.',
    'negative': 'Focus on DARK and INTENSE elements - create stories that explore deep emotions, challenges, and dramatic conflicts. Include elements of struggle, mystery, and emotional depth.',
    'traditional': 'Focus on CLASSIC and TIMELESS elements - create stories with familiar themes, moral lessons, and traditional storytelling structures. Include elements of wisdom, heritage, and enduring values.',
    'avant-garde': 'Focus on SURREAL and MIND-BENDING elements - create stories that defy reality, logic, and conventional thinking. Include elements of surrealism, abstract concepts, and impossible scenarios.',
    'neutral': 'Focus on BALANCED and HARMONIOUS elements - create stories that blend different emotions and styles, offering a well-rounded experience. Include elements of balance, harmony, and diverse perspectives.',
    'romantic': 'Focus on ROMANTIC and EMOTIONAL elements - create stories with deep emotional connections, love, and intimate moments. Include elements of passion, tenderness, and romantic tension.',
    'mysterious': 'Focus on MYSTERIOUS and ENIGMATIC elements - create stories with hidden secrets, unexplained phenomena, and suspenseful revelations. Include elements of intrigue, puzzles, and mysterious atmospheres.',
    'adventurous': 'Focus on ADVENTUROUS and THRILLING elements - create stories with exciting journeys, dangerous challenges, and epic quests. Include elements of exploration, risk-taking, and heroic actions.',
    'philosophical': 'Focus on PHILOSOPHICAL and THOUGHT-PROVOKING elements - create stories that explore deep questions about life, existence, and human nature. Include elements of wisdom, reflection, and intellectual depth.',
    'surreal': 'Focus on SURREAL and DREAMLIKE elements - create stories that blend reality with fantasy, creating impossible and magical scenarios. Include elements of dream logic, impossible physics, and magical realism.'
  };
  
  return stylePrompts[style] || 'Create a story that matches the selected style with appropriate elements and atmosphere.';
}

// 根據風格生成特定的提示詞（中文版）
function getStyleSpecificPromptChinese(style: string): string {
  const stylePrompts: Record<string, string> = {
    // 原有風格
    'healing': '專注於治癒和療癒元素 - 創造提供安慰、希望和情感治癒的故事。包含康復、支持和積極轉變的元素。',
    'funny': '專注於幽默和娛樂元素 - 創造讓讀者發笑和感到快樂的故事。包含喜劇、機智和輕鬆時刻的元素。',
    'passion': '專注於激情和強烈元素 - 創造具有強烈情感、戲劇性衝突和強大動機的故事。包含慾望、衝突和情感強度的元素。',
    'mystery': '專注於神秘和謎樣元素 - 創造具有隱藏秘密、無法解釋現象和懸疑啟示的故事。包含陰謀、謎題和神秘氛圍的元素。',
    'cute': '專注於可愛和溫馨元素 - 創造甜美、迷人和溫暖人心的故事。包含純真、友誼和溫柔情感的元素。',
    'dramatic': '專注於戲劇性和戲劇化元素 - 創造具有強烈情感、衝突和強大敘事的故事。包含張力、高潮和情感衝擊的元素。',
    'whimsical': '專注於奇幻和幻想元素 - 創造具有魔法、想像力和遊戲性元素的故事。包含奇蹟、創造力和魔法現實主義的元素。',
    'elegant': '專注於優雅和精緻元素 - 創造具有精緻、文化和優雅元素的故事。包含美麗、精緻和精緻品味的元素。',
    'raw': '專注於原始和真實元素 - 創造具有誠實、未過濾和真實情感的故事。包含真理、脆弱性和真實人類體驗的元素。',
    'dreamy': '專注於夢幻和空靈元素 - 創造具有柔和、神秘和超凡脫俗氛圍的故事。包含夢想、幻想和魔法現實主義的元素。',
    // 原情境選項
    'positive': '專注於提升和激勵元素 - 創造讓讀者感到有力量、充滿希望和動力的故事。包含勝利、成長和積極轉變的元素。',
    'negative': '專注於黑暗和強烈元素 - 創造探索深層情感、挑戰和戲劇性衝突的故事。包含掙扎、神秘和情感深度的元素。',
    'traditional': '專注於經典和永恆元素 - 創造具有熟悉主題、道德教訓和傳統敘事結構的故事。包含智慧、傳承和持久價值的元素。',
    'avant-garde': '專注於超現實和令人震撼的元素 - 創造違反現實、邏輯和常規思維的故事。包含超現實主義、抽象概念和不可能場景的元素。',
    'neutral': '專注於平衡和和諧元素 - 創造融合不同情感和風格的平衡故事。包含平衡、和諧和多樣化視角的元素。',
    'romantic': '專注於浪漫和情感元素 - 創造具有深層情感聯繫、愛情和親密時刻的故事。包含激情、溫柔和浪漫張力的元素。',
    'mysterious': '專注於神秘和謎樣元素 - 創造具有隱藏秘密、無法解釋現象和懸疑啟示的故事。包含陰謀、謎題和神秘氛圍的元素。',
    'adventurous': '專注於冒險和刺激元素 - 創造具有刺激旅程、危險挑戰和史詩任務的故事。包含探索、冒險和英雄行動的元素。',
    'philosophical': '專注於哲學和發人深省的元素 - 創造探索關於生活、存在和人性深層問題的故事。包含智慧、反思和知識深度的元素。',
    'surreal': '專注於超現實和夢幻元素 - 創造融合現實與幻想、創造不可能和魔法場景的故事。包含夢幻邏輯、不可能物理和魔法現實主義的元素。'
  };
  
  return stylePrompts[style] || '創造一個與所選風格相匹配的故事，包含適當的元素和氛圍。';
}
