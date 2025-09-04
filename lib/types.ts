export interface GeneratePayload {
  mood: string;            // 例：「心情低落但想被鼓勵」
  context?: string;        // 情境選擇
  style?: 'healing' | 'funny' | 'passion' | 'mystery' | 'cute' | 'dramatic' | 'whimsical' | 'elegant' | 'raw' | 'dreamy' | 'positive' | 'negative' | 'traditional' | 'avant-garde' | 'neutral' | 'romantic' | 'mysterious' | 'adventurous' | 'philosophical' | 'surreal';
  voiceGender?: 'male' | 'female';  // 語音性別選擇
}

export interface ComicPanel {
  index: number; // 0..3
  title: string;
  narration: string; // 旁白
  dialogue: string;  // 角色對白（可空）
  visual_prompt: string; // 給影像模型的提示語
  duration_sec: number;  // 建議單格播放秒數
  image_b64?: string;    // data:image/png;base64,...
  audio_b64?: string;    // 語音數據（已移除，但保留類型兼容性）
  sfx_audio_b64?: string; // 音效數據（已移除，但保留類型兼容性）
}

export interface GenerateResponse {
  panels: ComicPanel[];
  meta: {
    mood: string;
    context?: string;      // 添加 context 到響應元數據
    style?: string;
    model_text: string;
    model_image: string;
    cost_estimate_usd: number;
    cached_hits: number;
    generation_time_ms?: number; // 生成總時間（毫秒）
  };
}
