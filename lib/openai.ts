import OpenAI from 'openai';
import { SYSTEM_STORY, USER_STORY, IMAGE_STYLE_SUFFIX, TTS_TEXT } from './prompts';
import { ComicPanel } from './types';
import { generateCacheKey, hasCache, getCache, setCache } from './cache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 指數退避重試函數
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      
      if (error?.status === 429) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// 生成分鏡腳本
export async function genStoryboard(
  mood: string,
  context?: string,
  style?: string
): Promise<ComicPanel[]> {
  
  // 添加詳細的調試信息
  console.log('🎬 故事生成開始:', {
    mood,
    context,
    style,
    timestamp: new Date().toISOString()
  });
  
  // 強制使用新的提示詞，避免任何快取問題
      const uniquePrompt = `${USER_STORY(mood, style)}\n\n[唯一標識: ${Date.now()}]\n[隨機數: ${Math.random()}]\n[用戶主題: ${mood}]\n[絕對禁止重複內容]`;
  
  const response = await retryWithBackoff(async () => {
    console.log('🎬 發送給OpenAI的提示詞:', uniquePrompt);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 使用更快的GPT-4o-mini模型
      messages: [
        { role: 'system', content: SYSTEM_STORY },
        { role: 'user', content: uniquePrompt }
      ],
      temperature: 0.9, // 大幅提高溫度，最大化多樣性
      max_tokens: 1000, // 統一token數量，確保完整的故事
      presence_penalty: 0.3, // 大幅增加存在懲罰，避免重複
      frequency_penalty: 0.3, // 大幅增加頻率懲罰，避免重複
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    console.log('🎬 OpenAI回應內容:', content);
    console.log('🎬 回應長度:', content.length);

    try {
      // 清理可能的 markdown 格式
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '');
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.replace(/\s*```$/, '');
      }
      
      // 修復常見的 JSON 語法錯誤
      cleanedContent = cleanedContent
        // 修復未轉義的單引號
        .replace(/(?<!\\)'([^']*?)'(?=\s*[,}])/g, '"$1"')
        // 修復多餘的單引號
        .replace(/'([^']*?)',/g, '"$1",')
        .replace(/'([^']*?)'}/g, '"$1"}')
        // 修復缺少的引號
        .replace(/([a-zA-Z_][a-zA-Z0-9_]*):\s*([^",\{\}\[\]]+?)(?=\s*[,}])/g, '$1: "$2"')
        // 修復控制字符
        .replace(/[\x00-\x1F\x7F]/g, '');
      
      console.log('🎬 清理後的內容:', cleanedContent);
      
      const parsed = JSON.parse(cleanedContent);
      console.log('🎬 解析後的JSON:', JSON.stringify(parsed, null, 2));
      
      if (!parsed.panels || !Array.isArray(parsed.panels)) {
        throw new Error('Invalid panel structure: missing panels array');
      }
      
      if (parsed.panels.length !== 4) {
        throw new Error(`Invalid panel count: expected 4, got ${parsed.panels.length}`);
      }
      
      // 驗證每個面板的完整性
      parsed.panels.forEach((panel: any, index: number) => {
        if (!panel.title || !panel.narration || !panel.visual_prompt || !panel.duration_sec) {
          throw new Error(`Panel ${index + 1} is incomplete: missing required fields`);
        }
        
        // 檢查內容是否被截斷
        if (panel.narration.length < 10) {
          throw new Error(`Panel ${index + 1} narration is too short, likely truncated`);
        }
      });
      
      // 驗證每個面板的內容是否與主題相關
      parsed.panels.forEach((panel: any, index: number) => {
        console.log(`🎬 第${index + 1}格內容:`, {
          title: panel.title,
          narration: panel.narration,
          visual_prompt: panel.visual_prompt
        });
        
        // 檢查內容是否與主題相關
        const panelContent = `${panel.title} ${panel.narration} ${panel.visual_prompt}`.toLowerCase();
        const moodLower = mood.toLowerCase();
        
        if (!panelContent.includes(moodLower) && !moodLower.includes(panelContent)) {
          console.warn(`⚠️ 第${index + 1}格內容可能與主題"${mood}"無關`);
        }
      });
      
      return parsed.panels;
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', content);
      
      // 不再使用預設模板，直接拋出錯誤
      throw new Error(`故事生成失敗: ${parseError.message || '未知錯誤'}`);
    }
  });

  return response;
}

// 生成圖片（Base64）
export async function genImageB64(
  visualPrompt: string,
  style?: string
): Promise<string> {
  const cacheKey = generateCacheKey(visualPrompt, style);
  
  // 檢查快取
  if (hasCache(cacheKey)) {
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('Cache hit for image:', cacheKey);
      return cached;
    }
  }

  console.log('Generating image with prompt:', visualPrompt);
  
  const response = await retryWithBackoff(async () => {
    try {
      const fullPrompt = `${visualPrompt}${IMAGE_STYLE_SUFFIX}`;
      console.log('Full image prompt:', fullPrompt);
      
      const image = await Promise.race([
        openai.images.generate({
          model: 'dall-e-2', // 使用更快的DALL-E 2模型
          prompt: fullPrompt,
          size: '256x256', // 使用更小尺寸，速度更快
          n: 1,
        }) as Promise<any>,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Image generation timeout')), 15000) // 15秒超時
        )
      ]);

      console.log('Image generation response:', image);

      const imageUrl = image.data?.[0]?.url;
      if (!imageUrl) {
        console.error('No image URL in response:', image);
        throw new Error('No image generated');
      }

      console.log('Downloading image from:', imageUrl);

      // 下載圖片並轉換為 Base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`);
      }
      
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      console.log('Image generated successfully, size:', base64.length);

      // 儲存到快取
      setCache(cacheKey, dataUrl);
      
      return dataUrl;
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  });

  return response;
}

// 生成語音（Base64）
export async function genAudioB64(
  text: string,
  gender: 'male' | 'female' = 'male',
  style: 'magnetic' | 'professional' = 'magnetic'
): Promise<string> {
  const cacheKey = generateCacheKey(text, `${gender}-${style}`);
  
  // 檢查快取
  if (hasCache(cacheKey)) {
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('Cache hit for audio:', cacheKey);
      return cached;
    }
  }

  console.log('Generating audio for text:', text);
  
  const response = await retryWithBackoff(async () => {
    try {
      // 根據性別和風格選擇語音
      let voice: string;
      if (gender === 'female') {
        voice = style === 'magnetic' ? 'nova' : 'alloy';
      } else {
        voice = style === 'magnetic' ? 'echo' : 'onyx';
      }

      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text,
        response_format: 'mp3',
        speed: 1.0,
      });

      const arrayBuffer = await mp3.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:audio/mpeg;base64,${base64}`;

      console.log('Audio generated successfully, size:', base64.length);

      // 儲存到快取
      setCache(cacheKey, dataUrl);
      
      return dataUrl;
    } catch (error) {
      console.error('Audio generation error:', error);
      throw error;
    }
  });

  return response;
}

// 生成TTS語音（Base64）- 兼容舊的API調用
export async function genTTSB64(
  title: string,
  narration: string,
  dialogue: string,
  sfx?: string,
  gender: 'male' | 'female' = 'male',
  style: 'magnetic' | 'warm' | 'energetic' | 'calm' | 'narrator' = 'magnetic',
  mood?: string
): Promise<string> {
  // 組合TTS文本
  const ttsText = TTS_TEXT(title, narration, dialogue, sfx);
  
  // 如果提供了mood，將其添加到文本中
  const finalText = mood ? `${ttsText} 基於主題：${mood}` : ttsText;
  
  console.log('Generating TTS for text:', finalText);
  
  // 將新的風格類型映射到舊的類型
  const mappedStyle = style === 'magnetic' ? 'magnetic' : 'professional';
  
  return genAudioB64(finalText, gender, mappedStyle);
}

// 生成音效（Base64）
export async function genSFXB64(
  sfxText: string,
  gender: 'male' | 'female' = 'male'
): Promise<string> {
  const cacheKey = generateCacheKey(sfxText, `${gender}-sfx`);
  
  // 檢查快取
  if (hasCache(cacheKey)) {
    const cached = getCache(cacheKey);
    if (cached) {
      console.log('Cache hit for SFX:', cacheKey);
      return cached;
    }
  }

  console.log('Generating SFX for text:', sfxText);
  
  const response = await retryWithBackoff(async () => {
    try {
      // 根據性別選擇音效語音，避免男女聲混合
      const sfxVoice = gender === 'female' ? 'nova' : 'alloy';
      
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: sfxVoice, // 根據性別選擇語音
        input: sfxText,
        response_format: 'mp3',
        speed: 0.8, // 稍微慢一點更像音效
      });

      const arrayBuffer = await mp3.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return `data:audio/mpeg;base64,${base64}`;
    } catch (error) {
      console.error('SFX generation error:', error);
      throw error;
    }
  });

  return response;
}
