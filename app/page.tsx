'use client';

import React, { useState } from 'react';
import { MoodForm } from '@/components/MoodForm';
import { ComicPlayer } from '@/components/ComicPlayer';
import { GeneratePayload, GenerateResponse } from '@/lib/types';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [comicData, setComicData] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (payload: GeneratePayload) => {
    console.log('🚀 開始生成故事:', payload);
    setIsLoading(true);
    setError(null);
    setComicData(null);

    try {
      console.log('📡 發送API請求...');
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 API響應狀態:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '無法解析錯誤信息' }));
        console.error('❌ API錯誤:', errorData);
        throw new Error(errorData.error || `生成失敗 (${response.status}): ${response.statusText}`);
      }

      console.log('✅ API請求成功，解析響應...');
      const data: GenerateResponse = await response.json();
      console.log('📊 解析後的數據:', data);
      
      if (!data.panels || data.panels.length === 0) {
        throw new Error('API返回的數據格式不正確');
      }
      
      console.log('🎬 設置故事數據...');
      setComicData(data);
      console.log('✅ 故事數據設置完成');
    } catch (err) {
      console.error('❌ 生成錯誤:', err);
      const errorMessage = err instanceof Error ? err.message : '發生未知錯誤';
      setError(errorMessage);
      
      // 不顯示 alert，讓 MoodForm 組件處理錯誤
      // 這樣可以觸發友善提示
    } finally {
      console.log('🔄 設置加載狀態為false');
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setComicData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative">
      {/* 背景圖片 - 強制固定定位，手機版絕對不捲動 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/stress.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.7,
          filter: 'contrast(1.3) brightness(1.15) saturate(1.2)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: 'none',
          willChange: 'auto',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      
      {/* 背景遮罩 - 強制固定定位，手機版絕對不捲動 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(0.3px)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: 'none',
          willChange: 'auto',
        }}
      />
      
      {/* 左上角LOGO - 強制固定定位，手機版絕對不捲動 */}
      <div 
        className="fixed top-0 left-0 z-20 p-0"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          transform: 'translateY(-20px)',
          willChange: 'auto',
        }}
      >
        <img
          src="/ctx-logo.png"
          alt="MoodStory Logo"
          className="h-24 w-auto drop-shadow-lg"
        />
      </div>
      
      {/* 內容容器 */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">MoodStory</h1>
          
          {/* 副標題白色卡片 */}
          <div className="inline-block bg-white/95 dark:bg-white/90 rounded-xl px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-300 backdrop-blur-sm">
            <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🚇 每天通勤5分鐘，讓AI畫一篇專屬你的4格語音漫畫 ✨
            </p>
          </div>
          
          {/* 新增：通勤族專屬價值主張 */}
          <div className="mt-4 inline-block bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg px-4 py-2 shadow-md">
            <p className="text-sm text-blue-800 font-medium">
              🎯 專為通勤族設計 • 快速生成 • 專屬故事 • 輕量4格語音漫畫
            </p>
          </div>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* 主要內容 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 左側：輸入表單 */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-700 rounded-lg p-4 sm:p-6 shadow-lg backdrop-blur-sm mx-4 sm:mx-2 lg:mx-0">
              <h2 className="text-2xl font-semibold mb-4 text-black sm:bg-gradient-to-r sm:from-blue-600 sm:to-purple-600 sm:bg-clip-text sm:text-transparent drop-shadow-lg">輸入故事主題</h2>
              <MoodForm onSubmit={handleGenerate} isLoading={isLoading} />
            </div>
          </div>

          {/* 右側：漫畫播放器 */}
          <div className="space-y-6">
            {comicData ? (
              <div className="bg-card border rounded-lg p-6">
                <ComicPlayer 
                  data={comicData} 
                  onRestart={handleRestart}
                />
              </div>
            ) : (
              <div className="bg-card border rounded-lg p-4 sm:p-6 h-[600px] flex items-center justify-center mx-4 sm:mx-2 lg:mx-0">
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-4">🚇</div>
                  <p className="text-lg">輸入故事主題開始生成你的專屬4格語音漫畫</p>
                  <p className="text-sm mt-2">
                    每格漫畫都包含精美插圖和磁性語音講述的連續性故事
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">💡 通勤族專屬體驗</p>
                    <p className="text-xs text-blue-600">• 快速生成，5分鐘完成</p>
                    <p className="text-xs text-blue-600">• 4格輕量語音漫畫，適合碎片時間</p>
                    <p className="text-xs text-blue-600">• 專屬故事，每天都有新驚喜</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部說明 */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>🚇 專為通勤族設計 • 4格輕量語音漫畫 • 5分鐘快速生成 • 專屬故事體驗</p>
        </div>
      </div>
    </div>
  );
}
