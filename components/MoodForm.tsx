import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GeneratePayload } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface MoodFormProps {
  onSubmit: (payload: GeneratePayload) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function MoodForm({ onSubmit, isLoading = false, className }: MoodFormProps) {
  const [mood, setMood] = useState('');
  const [style, setStyle] = useState<'healing' | 'funny' | 'passion' | 'mystery' | 'cute' | 'dramatic' | 'whimsical' | 'elegant' | 'raw' | 'dreamy' | 'positive' | 'negative' | 'traditional' | 'avant-garde' | 'neutral' | 'romantic' | 'mysterious' | 'adventurous' | 'philosophical' | 'surreal' | ''>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 語音模式狀態
  const [voiceMode, setVoiceMode] = useState<'story' | 'style' | 'generate'>('story');
  const [voiceInstructions, setVoiceInstructions] = useState('點擊麥克風開始語音輸入故事主題');

  // 檢查瀏覽器支援語音辨識
  useEffect(() => {
    const checkSpeechSupport = () => {
      const hasSpeechRecognition = typeof window !== 'undefined' && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
      
      console.log('Speech Recognition Support Check:');
      console.log('- typeof window:', typeof window);
      console.log('- SpeechRecognition in window:', 'SpeechRecognition' in window);
      console.log('- webkitSpeechRecognition in window:', 'webkitSpeechRecognition' in window);
      console.log('- hasSpeechSupport:', hasSpeechRecognition);
      
      setIsSpeechSupported(hasSpeechRecognition);
      
      // 如果支援，立即初始化
      if (hasSpeechRecognition) {
        initSpeechRecognition();
      }
    };
    
    checkSpeechSupport();
  }, []);

  // 改進語音辨識初始化，支援Chrome和Safari
  const initSpeechRecognition = () => {
    if (typeof window === 'undefined') return false;

    try {
      // 優先使用webkitSpeechRecognition（Chrome），然後是SpeechRecognition（Safari）
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('您的瀏覽器不支援語音辨識功能，請使用 Chrome 或 Safari 瀏覽器');
        return false;
      }
      
      recognitionRef.current = new SpeechRecognition();
      console.log('🎤 語音辨識實例創建成功，類型:', SpeechRecognition.name || '未知');
      
      // Chrome和Safari的兼容性配置
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      
      // 嘗試多種語言設置，提高Chrome兼容性
      try {
        recognitionRef.current.lang = 'zh-TW'; // 繁體中文
      } catch (e) {
        try {
          recognitionRef.current.lang = 'zh-CN'; // 簡體中文
        } catch (e2) {
          try {
            recognitionRef.current.lang = 'en-US'; // 英文
          } catch (e3) {
            console.log('🎤 無法設置語言，使用預設');
          }
        }
      }
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('🎤 正在聆聽...');
        console.log('🎤 語音辨識開始，isListening:', true);
        console.log('🎤 瀏覽器類型:', navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari/其他');
        
        // 限制總聆聽時間為10秒
        setTimeout(() => {
          if (isListening) {
            console.log('🎤 10秒聆聽時間到，自動停止');
            stopVoiceInput();
          }
        }, 10000);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        console.log('🎤 語音辨識結果:', transcript);
        
        // 根據語音模式處理不同的語音指令
        handleVoiceCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('🎤 語音辨識錯誤:', event.error);
        setTranscript(`❌ 語音辨識錯誤: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log('🎤 語音辨識結束');
        setIsListening(false);
      };

      return true;
    } catch (error) {
      console.error('🎤 語音辨識初始化失敗:', error);
      return false;
    }
  };

  // 處理語音指令
  const handleVoiceCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    switch (voiceMode) {
      case 'story':
        // 語音輸入故事主題
        setMood(transcript);
        setTranscript(`✅ 故事主題: ${transcript}`);
        setVoiceMode('style');
        setVoiceInstructions('請說出你想要的風格，例如：浪漫、治癒、搞笑、神秘等');
        // 自動繼續聆聽風格選擇
        setTimeout(() => {
          if (recognitionRef.current && !isListening) {
            console.log('🎤 自動繼續聆聽風格選擇');
            recognitionRef.current.start();
          }
        }, 1000);
        break;
        
      case 'style':
        // 語音選擇風格
        const selectedStyle = mapVoiceToStyle(lowerTranscript);
        if (selectedStyle) {
          setStyle(selectedStyle as any);
          setTranscript(`✅ 風格選擇: ${getStyleDisplayName(selectedStyle)}`);
          setVoiceMode('generate');
          setVoiceInstructions('說「生成」或「開始」來啟動故事生成');
          // 自動繼續聆聽生成指令
          setTimeout(() => {
            if (recognitionRef.current && !isListening) {
              console.log('🎤 自動繼續聆聽生成指令');
              recognitionRef.current.start();
            }
          }, 1000);
        } else {
          setTranscript(`❌ 未識別風格: ${transcript}，請重試`);
          // 風格識別失敗，繼續聆聽風格選擇
          setTimeout(() => {
            if (recognitionRef.current && !isListening) {
              console.log('🎤 風格識別失敗，繼續聆聽');
              recognitionRef.current.start();
            }
          }, 1000);
        }
        break;
        
      case 'generate':
        // 語音啟動生成
        if (lowerTranscript.includes('生成') || lowerTranscript.includes('開始') || lowerTranscript.includes('go')) {
          setTranscript('🚀 語音啟動生成...');
          handleSubmit(new Event('submit') as any);
        } else {
          setTranscript(`❌ 請說「生成」或「開始」來啟動`);
          // 生成指令錯誤，繼續聆聽
          setTimeout(() => {
            if (recognitionRef.current && !isListening) {
              console.log('🎤 生成指令錯誤，繼續聆聽');
              recognitionRef.current.start();
            }
          }, 1000);
        }
        break;
    }
    
    // 延遲重置語音模式
    setTimeout(() => {
      if (voiceMode !== 'generate') {
        setTranscript('');
      }
    }, 3000);
  };

  // 語音到風格的映射
  const mapVoiceToStyle = (voiceText: string): string | null => {
    const styleMap: Record<string, string> = {
      '浪漫': 'romantic',
      '治癒': 'healing',
      '搞笑': 'funny',
      '神秘': 'mystery',
      '可愛': 'cute',
      '戲劇': 'dramatic',
      '奇幻': 'whimsical',
      '優雅': 'elegant',
      '原始': 'raw',
      '夢幻': 'dreamy',
      '積極': 'positive',
      '消極': 'negative',
      '傳統': 'traditional',
      '前衛': 'avant-garde',
      '中性': 'neutral',
      '冒險': 'adventurous',
      '哲學': 'philosophical',
      '超現實': 'surreal',
      '熱血': 'passion',
      '溫馨': 'cute'
    };
    
    for (const [chinese, english] of Object.entries(styleMap)) {
      if (voiceText.includes(chinese) || voiceText.includes(english)) {
        return english;
      }
    }
    
    return null;
  };

  // 獲取風格顯示名稱
  const getStyleDisplayName = (styleValue: string): string => {
    const styleNames: Record<string, string> = {
      'romantic': '浪漫溫情',
      'healing': '治癒系',
      'funny': '搞笑幽默',
      'mystery': '神秘懸疑',
      'cute': '可愛溫馨',
      'dramatic': '戲劇性',
      'whimsical': '奇幻',
      'elegant': '優雅',
      'raw': '原始',
      'dreamy': '夢幻',
      'positive': '積極正向',
      'negative': '消極負向',
      'traditional': '傳統經典',
      'avant-garde': '前衛創新',
      'neutral': '中性平衡',
      'adventurous': '冒險刺激',
      'philosophical': '哲思深度',
      'surreal': '超現實主義',
      'passion': '熱血勵志'
    };
    
    return styleNames[styleValue] || styleValue;
  };

  // 開始語音輸入
  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      if (!initSpeechRecognition()) {
        return;
      }
    }
    
    try {
      recognitionRef.current.start();
      console.log('🎤 開始語音辨識');
    } catch (error) {
      console.error('🎤 啟動語音辨識失敗:', error);
      setTranscript('❌ 語音辨識啟動失敗');
    }
  };

  // 停止語音輸入
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('🎤 停止語音辨識');
      } catch (error) {
        console.error('🎤 停止語音辨識失敗:', error);
      }
    }
    setIsListening(false);
  };

  // 重置語音模式
  const resetVoiceMode = () => {
    setVoiceMode('story');
    setVoiceInstructions('點擊麥克風開始語音輸入故事主題');
    setTranscript('');
  };

  // 切換語音輸入
  const toggleVoiceInput = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  // 改進表單提交處理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== FORM SUBMIT STARTED ===');
    console.log('Event type:', e.type);
    console.log('Event target:', e.target);
    console.log('Form submitted', { mood, style });
    console.log('isLoading:', isLoading);
    console.log('mood.trim():', mood.trim());
    console.log('mood.trim().length:', mood.trim().length);
    
    if (!mood.trim()) {
      console.log('Mood is empty, showing alert');
      alert('請輸入你的心情');
      return;
    }

    const payload: GeneratePayload = {
      mood: mood.trim(),
      style: style || undefined,
    };

    console.log('Submitting payload:', payload);
    console.log('Calling onSubmit function...');
    
    try {
      await onSubmit(payload);
      console.log('onSubmit completed successfully');
    } catch (error) {
      console.error('onSubmit failed:', error);
      alert('提交失敗，請重試');
    }
    console.log('=== FORM SUBMIT ENDED ===');
  };

  // 添加觸摸事件處理
  const handleTouchSubmit = (e: React.TouchEvent) => {
    e.preventDefault();
    console.log('Touch submit event triggered');
    handleSubmit(e as any);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* 全流程語音操作指南 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-blue-800 mb-2">🎤 全流程語音操作</h2>
          <p className="text-blue-600 text-lg">完全用語音控制整個故事生成流程！</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 第1步 */}
          <div className="bg-white rounded-lg p-4 border-2 border-blue-300 shadow-md">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">1</div>
              <h3 className="font-bold text-blue-800 mb-2">語音輸入故事主題</h3>
              <p className="text-sm text-gray-600 mb-3">點擊麥克風按鈕，說出你的故事主題</p>
              <div className="bg-blue-100 rounded-lg p-2">
                <p className="text-xs text-blue-700 font-medium">例如：</p>
                <p className="text-xs text-blue-600">「一隻會飛的貓」</p>
                <p className="text-xs text-blue-600">「太空冒險」</p>
                <p className="text-xs text-blue-600">「魔法學校」</p>
              </div>
            </div>
          </div>
          
          {/* 第2步 */}
          <div className="bg-white rounded-lg p-4 border-2 border-purple-300 shadow-md">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">2</div>
              <h3 className="font-bold text-purple-800 mb-2">語音選擇風格</h3>
              <p className="text-sm text-gray-600 mb-3">系統自動切換到風格選擇模式</p>
              <div className="bg-purple-100 rounded-lg p-2">
                <p className="text-xs text-purple-700 font-medium">支援風格：</p>
                <p className="text-xs text-purple-600">浪漫、治癒、搞笑、神秘</p>
                <p className="text-xs text-purple-600">可愛、戲劇、奇幻、優雅</p>
                <p className="text-xs text-purple-600">原始、夢幻、積極、消極</p>
                <p className="text-xs text-purple-600">傳統、前衛、中性、冒險</p>
                <p className="text-xs text-purple-600">哲學、超現實、熱血、溫馨</p>
              </div>
            </div>
          </div>
          
          {/* 第3步 */}
          <div className="bg-white rounded-lg p-4 border-2 border-green-300 shadow-md">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">3</div>
              <h3 className="font-bold text-green-800 mb-2">語音啟動生成</h3>
              <p className="text-sm text-gray-600 mb-3">說出啟動指令，系統自動生成故事</p>
              <div className="bg-green-100 rounded-lg p-2">
                <p className="text-xs text-green-700 font-medium">啟動指令：</p>
                <p className="text-xs text-green-600">「生成」</p>
                <p className="text-xs text-green-600">「開始」</p>
                <p className="text-xs text-green-600">「go」</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-blue-700 font-medium">✨ 全程無需觸碰鍵盤，完全用語音操作！</p>
        </div>
      </div>

      {/* 故事主題輸入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-purple-400 sm:text-purple-700 sm:dark:text-purple-300">故事主題 *</label>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="例如：說出你的心情，或寫「一隻會說話的貓、太空冒險、魔法學校、未來世界、愛情故事、科幻冒險...」"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            maxLength={20}
            className="flex-1 border-purple-300 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-600 text-black sm:text-black placeholder:text-gray-500"
            disabled={isLoading}
          />
          <Button
            type="button"
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={!isSpeechSupported || isLoading}
            className={cn(
              "px-3 py-2 border-0 shadow-lg touch-manipulation",
              isListening 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
            onTouchEnd={(e) => {
              e.preventDefault();
              if (!isLoading && isSpeechSupported) {
                isListening ? stopVoiceInput() : startVoiceInput();
              }
            }}
          >
            {isListening ? '🔴' : '🎤'}
          </Button>
        </div>
        
        {/* 字數限制提示 */}
        <div className="text-xs text-gray-500 text-right">
          {mood.length}/20 字
        </div>
        
        {/* 語音指令提示 */}
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-200">
          <p className="font-medium">🎤 點擊麥克風開始語音輸入故事主題-2️⃣ 風格-3️⃣ 生成or開始or Go</p>
          {voiceMode === 'style' && (
            <p className="mt-1 text-gray-600">支援的風格：浪漫、治癒、搞笑、神秘、可愛、戲劇、奇幻、優雅、原始、夢幻、積極、消極、傳統、前衛、中性、冒險、哲學、超現實、熱血、溫馨</p>
          )}
          {voiceMode === 'generate' && (
            <p className="mt-1 text-gray-600">說「生成」、「開始」或「go」來啟動故事生成</p>
          )}
        </div>
        
        {/* 語音狀態顯示 */}
        {transcript && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md border border-green-200">
            {transcript}
          </div>
        )}
        
        {/* 語音模式指示器 */}
        <div className="flex items-center space-x-2 text-xs text-purple-600">
          <span className={`px-2 py-1 rounded ${voiceMode === 'story' ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
            1️⃣ 故事主題
          </span>
          <span className={`px-2 py-1 rounded ${voiceMode === 'style' ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
            2️⃣ 選擇風格
          </span>
          <span className={`px-2 py-1 rounded ${voiceMode === 'generate' ? 'bg-purple-200 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
            3️⃣ 啟動生成
          </span>
        </div>
        
        {/* 重置語音模式按鈕 */}
        {voiceMode !== 'story' && (
          <Button
            type="button"
            onClick={resetVoiceMode}
            className="text-xs px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white"
          >
            重新開始語音流程
          </Button>
        )}
      </div>



      {/* 風格選擇 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-purple-400 sm:text-purple-700 sm:dark:text-purple-300">風格（可選）</label>
        <select
          className="flex h-10 w-full rounded-md border border-purple-300 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50 text-black sm:text-black"
          value={style}
          onChange={(e) => setStyle(e.target.value as 'healing' | 'funny' | 'passion' | 'mystery' | 'cute' | 'dramatic' | 'whimsical' | 'elegant' | 'raw' | 'dreamy' | 'positive' | 'negative' | 'traditional' | 'avant-garde' | 'neutral' | 'romantic' | 'mysterious' | 'adventurous' | 'philosophical' | 'surreal' | '')}
        >
          <option value="">選擇風格</option>
          <option value="healing">治癒系</option>
          <option value="funny">搞笑幽默</option>
          <option value="passion">熱血勵志</option>
          <option value="mystery">神秘懸疑</option>
          <option value="cute">可愛溫馨</option>
          <option value="dramatic">戲劇性</option>
          <option value="whimsical">奇幻</option>
          <option value="elegant">優雅</option>
          <option value="raw">原始</option>
          <option value="dreamy">夢幻</option>
          <option value="positive">積極正向</option>
          <option value="negative">消極負向</option>
          <option value="traditional">傳統經典</option>
          <option value="avant-garde">前衛創新</option>
          <option value="neutral">中性平衡</option>
          <option value="romantic">浪漫溫情</option>
          <option value="mysterious">神秘懸疑</option>
          <option value="adventurous">冒險刺激</option>
          <option value="philosophical">哲思深度</option>
          <option value="surreal">超現實主義</option>
        </select>
        
        <p className="text-sm text-gray-500">選擇你喜歡的漫畫風格</p>
        
        {/* 語音風格選擇提示 */}
        {isSpeechSupported && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <p className="text-xs text-purple-700">
              💡 <strong>語音提示：</strong>或者直接說出風格名稱，例如「浪漫」、「治癒」、「搞笑」...
            </p>
          </div>
        )}
      </div>

      {/* 生成按鈕 */}
      <Button
        type="submit"
        disabled={!mood.trim() || isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            生成中...
          </>
        ) : (
          "生成我的漫畫故事"
        )}
      </Button>
      
      {/* 語音生成提示 */}
      {isSpeechSupported && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <p className="text-xs text-green-700">
            🎤 <strong>語音生成：</strong>或直接說出「生成」「開始」或「Go」
          </p>
        </div>
      )}

      {/* 提示信息 */}
      <div className="text-center text-xs text-blue-700 dark:text-blue-400 space-y-1">
        <p>✨ AI 會為你生成 4 格精美動畫</p>
        <p>🎨 包含精美插圖和完整故事內容</p>
        <p className="text-purple-600 font-medium">🎤 支援全流程語音操作：語音輸入 → 語音選擇風格 → 語音啟動生成</p>
      </div>
    </form>
  );
}
