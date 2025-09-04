import { NextRequest, NextResponse } from 'next/server';
import { genStoryboard, genImageB64, genTTSB64 } from '@/lib/openai';
import { GeneratePayload, GenerateResponse, ComicPanel } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    console.log('API route called');
    console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
    
    const body: GeneratePayload = await request.json();
    const { mood, context, style, voiceGender } = body;

    if (!mood || mood.trim().length === 0) {
      return NextResponse.json(
        { error: 'Mood is required' },
        { status: 400 }
      );
    }

    console.log('Generating comic for mood:', mood);


    // 1. 生成分鏡腳本
    console.log('Step 1: Generating storyboard...');
    const panels = await genStoryboard(mood, context, style);
    console.log(`Step 1 complete: ${panels.length} panels generated`);
    
    // 2. 將用戶文字填入每個面板
    const enrichedPanels: ComicPanel[] = [];
    let cachedHits = 0;

    console.log('Step 2: Processing panels in parallel...');
    const startTime = Date.now();

    // 優化：並行處理所有面板，提高速度
    const promises = panels.map(async (panel, index) => {
      // 使用 AI 生成的語音內容
      const panelWithText = {
        ...panel,
        index: index, // 確保 index 屬性存在
        title: panel.title || `場景 ${index + 1}`,
        narration: panel.narration || `基於您的心情：${mood}`,
        dialogue: panel.dialogue || '',
      };

      try {
        console.log(`Processing panel ${index + 1}/${panels.length}...`);

        // 生成圖片和語音
        const [imageB64, audioB64] = await Promise.all([
          genImageB64(panel.visual_prompt, style),
          genTTSB64(
            panel.title || `第 ${index + 1} 格`,
            panel.narration || `基於您的心情：${mood}`,
            panel.dialogue || '',
            undefined, // 音效
            voiceGender || 'male', // 使用傳入的語音性別，默認男聲
            'magnetic', // 磁性語音風格
            mood
          )
        ]);

        const enrichedPanel: ComicPanel = {
          ...panelWithText,
          image_b64: imageB64,
          audio_b64: audioB64, // 重新啟用語音
          sfx_audio_b64: undefined, // 暫時不啟用音效
        };

        // 檢查快取命中
        if (imageB64 && imageB64.includes('cache hit')) {
          cachedHits++;
        }

        console.log(`Panel ${index + 1} complete`);
        return enrichedPanel;
      } catch (error) {
        console.error(`Error processing panel ${index}:`, error);
        // 回傳只有文字的版本
        return {
          ...panelWithText,
          image_b64: undefined,
          audio_b64: undefined,
        };
      }
    });

    // 優化：使用 Promise.all 而不是 Promise.allSettled，提高速度
    const results = await Promise.all(promises);
    enrichedPanels.push(...results);

    const totalTime = Date.now() - startTime;
    console.log(`Step 2 complete: All panels processed in ${totalTime}ms`);
    console.log(`Average time per panel: ${totalTime / panels.length}ms`);

    // 3. 計算成本估算
    const costEstimate = calculateCostEstimate(cachedHits);

    const response: GenerateResponse = {
      panels: enrichedPanels,
      meta: {
        mood,
        context,
        style,
        model_text: 'gpt-4o-mini',
        model_image: 'dall-e-2', // 修正為實際使用的模型
        cost_estimate_usd: costEstimate,
        cached_hits: cachedHits,
        generation_time_ms: totalTime,
      },
    };

    console.log('Generation complete!');
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API Error:', error);
    
    // 根據錯誤類型返回不同的錯誤信息
    let errorMessage = '生成失敗，請重試';
    let statusCode = 500;
    
    if (error.message.includes('內容政策違規')) {
      errorMessage = '請輸入適當的故事主題，避免不當內容';
      statusCode = 400;
    } else if (error.message.includes('故事生成失敗')) {
      errorMessage = '故事生成失敗，請嘗試其他主題';
      statusCode = 400;
    } else if (error.message.includes('OpenAI')) {
      errorMessage = 'AI 服務暫時不可用，請稍後重試';
      statusCode = 503;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// 成本估算函數
function calculateCostEstimate(cachedHits: number): number {
  const baseCost = 0.15; // 統一基礎成本
  const imageCost = 0.04; // 統一圖片成本
  
  const totalImages = 4 - cachedHits; // 扣除快取命中的圖片
  
  return baseCost + (totalImages * imageCost);
}
