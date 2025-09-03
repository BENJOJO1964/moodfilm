import { NextRequest, NextResponse } from 'next/server';
import { genStoryboard, genImageB64, genTTSB64 } from '@/lib/openai';
import { GeneratePayload, GenerateResponse, ComicPanel } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    console.log('API route called');
    console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
    
    const body: GeneratePayload = await request.json();
    const { mood, context, style } = body;

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
        title: panel.title || `場景 ${index + 1}`,
        narration: panel.narration || `基於您的心情：${mood}`,
        dialogue: panel.dialogue || '',
      };

      try {
        console.log(`Processing panel ${index + 1}/${panels.length}...`);

        // 只生成圖片，移除語音功能
        const imageB64 = await genImageB64(panel.visual_prompt, style);

        const enrichedPanel: ComicPanel = {
          ...panelWithText,
          image_b64: imageB64,
          audio_b64: undefined, // 移除語音
          sfx_audio_b64: undefined, // 完全移除音效
        };

        // 檢查快取命中
        if (imageB64.status === 'fulfilled' && imageB64.value.includes('cache hit')) {
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
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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
