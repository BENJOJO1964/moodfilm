#!/usr/bin/env tsx

/**
 * 煙霧測試腳本
 * 測試 API 端點是否正常工作
 */

const API_URL = 'http://localhost:3000/api/generate';

const testPayload = {
  mood: '心情低落但想被鼓勵',
  context: 'commute' as const,
  style: 'healing' as const,
  mode: 'fast' as const,
  voiceGender: 'male' as const,
  voiceStyle: 'magnetic' as const,
};

async function runSmokeTest() {
  console.log('🚀 開始煙霧測試...\n');

  try {
    console.log('📤 發送測試請求...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`\n📥 回應狀態: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 回應錯誤:', errorText);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('\n✅ API 回應成功！');
    console.log('\n📊 檢查回應結構...');

    // 檢查基本結構
    if (!data.panels || !Array.isArray(data.panels)) {
      throw new Error('缺少 panels 陣列');
    }

    if (data.panels.length !== 4) {
      throw new Error(`panels 數量不正確: ${data.panels.length} (應為 4)`);
    }

    if (!data.meta) {
      throw new Error('缺少 meta 資訊');
    }

    // 檢查每個 panel
    data.panels.forEach((panel: any, index: number) => {
      console.log(`\n🔍 檢查第 ${index + 1} 格:`);
      
      if (!panel.title) {
        console.warn(`  ⚠️  第 ${index + 1} 格缺少 title`);
      } else {
        console.log(`  ✅ title: "${panel.title}"`);
      }

      if (!panel.narration) {
        console.warn(`  ⚠️  第 ${index + 1} 格缺少 narration`);
      } else {
        console.log(`  ✅ narration: "${panel.narration.substring(0, 50)}..."`);
      }

      if (!panel.visual_prompt) {
        console.warn(`  ⚠️  第 ${index + 1} 格缺少 visual_prompt`);
      } else {
        console.log(`  ✅ visual_prompt: "${panel.visual_prompt.substring(0, 50)}..."`);
      }

      if (typeof panel.duration_sec !== 'number') {
        console.warn(`  ⚠️  第 ${index + 1} 格 duration_sec 不是數字`);
      } else {
        console.log(`  ✅ duration_sec: ${panel.duration_sec} 秒`);
      }

      if (panel.image_b64) {
        console.log(`  ✅ 圖片已生成 (${panel.image_b64.substring(0, 50)}...)`);
      } else {
        console.warn(`  ⚠️  第 ${index + 1} 格圖片未生成`);
      }

      if (panel.audio_b64) {
        console.log(`  ✅ 音訊已生成 (${panel.audio_b64.substring(0, 50)}...)`);
      } else {
        console.warn(`  ⚠️  第 ${index + 1} 格音訊未生成`);
      }
    });

    // 顯示 meta 資訊
    console.log('\n📈 Meta 資訊:');
    console.log(`  mood: ${data.meta.mood}`);
    console.log(`  context: ${data.meta.context || '未設定'}`);
    console.log(`  style: ${data.meta.style || '未設定'}`);
    console.log(`  mode: ${data.meta.mode}`);
    console.log(`  model_text: ${data.meta.model_text}`);
    console.log(`  model_image: ${data.meta.model_image}`);
    console.log(`  model_tts: ${data.meta.model_tts}`);
    console.log(`  cost_estimate_usd: $${data.meta.cost_estimate_usd.toFixed(3)}`);
    console.log(`  cached_hits: ${data.meta.cached_hits}`);

    // 統計
    const imagesGenerated = data.panels.filter((p: any) => p.image_b64).length;
    const audiosGenerated = data.panels.filter((p: any) => p.audio_b64).length;

    console.log('\n📊 生成統計:');
    console.log(`  圖片生成: ${imagesGenerated}/4`);
    console.log(`  音訊生成: ${audiosGenerated}/4`);
    console.log(`  快取命中: ${data.meta.cached_hits} 張圖片`);

    console.log('\n🎉 煙霧測試完成！API 運作正常。');

  } catch (error) {
    console.error('\n❌ 煙霧測試失敗:', error);
    process.exit(1);
  }
}

// 檢查是否在正確的環境中運行
if (process.env.NODE_ENV === 'production') {
  console.warn('⚠️  警告: 在生產環境中運行煙霧測試');
}

// 執行測試
runSmokeTest().catch((error) => {
  console.error('💥 測試執行失敗:', error);
  process.exit(1);
});
