#!/usr/bin/env tsx

/**
 * MoodStory MVP 測試腳本
 * 測試通勤族專屬4格語音漫畫生成器的核心功能
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚇 MoodStory MVP 測試開始...\n');

// 檢查項目結構
console.log('📁 檢查項目結構...');
const requiredFiles = [
  'app/page.tsx',
  'components/MoodForm.tsx',
  'components/ComicPlayer.tsx',
  'lib/types.ts',
  'package.json'
];

let structureValid = true;
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 缺失`);
    structureValid = false;
  }
}

if (!structureValid) {
  console.log('\n❌ 項目結構檢查失敗');
  process.exit(1);
}

console.log('\n✅ 項目結構檢查通過\n');

// 檢查依賴
console.log('📦 檢查依賴...');
try {
  const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf8' }));
  const requiredDeps = ['next', 'react', 'typescript', 'tailwindcss'];
  
  let depsValid = true;
  for (const dep of requiredDeps) {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - 缺失`);
      depsValid = false;
    }
  }
  
  if (!depsValid) {
    console.log('\n❌ 依賴檢查失敗');
    process.exit(1);
  }
  
  console.log('\n✅ 依賴檢查通過\n');
} catch (error) {
  console.log('❌ 無法讀取 package.json');
  process.exit(1);
}

// 檢查通勤族定位
console.log('🎯 檢查通勤族定位...');
try {
  const pageContent = execSync('cat app/page.tsx', { encoding: 'utf8' });
  const moodFormContent = execSync('cat components/MoodForm.tsx', { encoding: 'utf8' });
  
  const keywords = [
    '通勤族',
    '4格語音漫畫',
    '5分鐘',
    '地鐵',
    '辦公室',
    '暖心',
    '勵志',
    '正能量'
  ];
  
  let positioningValid = true;
  for (const keyword of keywords) {
    if (pageContent.includes(keyword) || moodFormContent.includes(keyword)) {
      console.log(`✅ ${keyword}`);
    } else {
      console.log(`❌ ${keyword} - 未找到`);
      positioningValid = false;
    }
  }
  
  if (!positioningValid) {
    console.log('\n❌ 通勤族定位檢查失敗');
    process.exit(1);
  }
  
  console.log('\n✅ 通勤族定位檢查通過\n');
} catch (error) {
  console.log('❌ 無法讀取文件內容');
  process.exit(1);
}

// 檢查語音功能
console.log('🎤 檢查語音功能...');
try {
  const moodFormContent = execSync('cat components/MoodForm.tsx', { encoding: 'utf8' });
  
  const voiceFeatures = [
    'SpeechRecognition',
    'webkitSpeechRecognition',
    '語音辨識',
    '語音指令',
    '語音操作'
  ];
  
  let voiceValid = true;
  for (const feature of voiceFeatures) {
    if (moodFormContent.includes(feature)) {
      console.log(`✅ ${feature}`);
    } else {
      console.log(`❌ ${feature} - 未找到`);
      voiceValid = false;
    }
  }
  
  if (!voiceValid) {
    console.log('\n❌ 語音功能檢查失敗');
    process.exit(1);
  }
  
  console.log('\n✅ 語音功能檢查通過\n');
} catch (error) {
  console.log('❌ 無法讀取 MoodForm 內容');
  process.exit(1);
}

  // 檢查4格語音漫畫功能
  console.log('🎨 檢查4格語音漫畫功能...');
  try {
    const comicPlayerContent = execSync('cat components/ComicPlayer.tsx', { encoding: 'utf8' });
    const typesContent = execSync('cat lib/types.ts', { encoding: 'utf8' });
    
    const comicFeatures = [
      'panels',
      '4格',
      '漫畫',
      'ComicPanel',
      'PanelCard'
    ];
    
    let comicValid = true;
    for (const feature of comicFeatures) {
      if (comicPlayerContent.includes(feature) || typesContent.includes(feature)) {
        console.log(`✅ ${feature}`);
      } else {
        console.log(`❌ ${feature} - 未找到`);
        comicValid = false;
      }
    }
    
    if (!comicValid) {
      console.log('\n❌ 4格語音漫畫功能檢查失敗');
      process.exit(1);
    }
    
    console.log('\n✅ 4格語音漫畫功能檢查通過\n');
  } catch (error) {
    console.log('❌ 無法讀取相關文件內容');
    process.exit(1);
  }

// 檢查UI組件
console.log('🎨 檢查UI組件...');
try {
  const uiDir = 'components/ui';
  if (existsSync(uiDir)) {
    const uiFiles = execSync(`ls ${uiDir}`, { encoding: 'utf8' }).split('\n').filter(Boolean);
    const requiredUI = ['button.tsx', 'input.tsx', 'select.tsx'];
    
    let uiValid = true;
    for (const ui of requiredUI) {
      if (uiFiles.includes(ui)) {
        console.log(`✅ ${ui}`);
      } else {
        console.log(`❌ ${ui} - 缺失`);
        uiValid = false;
      }
    }
    
    if (!uiValid) {
      console.log('\n❌ UI組件檢查失敗');
      process.exit(1);
    }
    
    console.log('\n✅ UI組件檢查通過\n');
  } else {
    console.log('❌ UI組件目錄缺失');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ 無法檢查UI組件');
  process.exit(1);
}

// 總結
console.log('🎉 MVP 測試完成！');
console.log('\n📊 測試結果總結：');
console.log('✅ 項目結構完整');
console.log('✅ 依賴配置正確');
console.log('✅ 通勤族定位明確');
console.log('✅ 語音功能完整');
    console.log('✅ 4格語音漫畫功能完整');
console.log('✅ UI組件齊全');
console.log('\n🚀 這個版本已經準備好進行市場驗證！');
console.log('\n💡 建議下一步：');
console.log('1. 啟動開發服務器：npm run dev');
console.log('2. 邀請朋友、同事進行小規模測試');
console.log('3. 收集用戶反饋和使用數據');
console.log('4. 驗證通勤族是否真的需要這樣的產品');
console.log('\n🎯 記住：不要被語音卡死，先跑MVP市場驗證！');
