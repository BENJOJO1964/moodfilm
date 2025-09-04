import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GeneratePayload } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { FriendlyAlert } from './FriendlyAlert';

interface MoodFormProps {
  onSubmit: (payload: GeneratePayload) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function MoodForm({ onSubmit, isLoading = false, className }: MoodFormProps) {
  const [mood, setMood] = useState('');
  const [style, setStyle] = useState<'healing' | 'funny' | 'passion' | 'mystery' | 'cute' | 'dramatic' | 'whimsical' | 'elegant' | 'raw' | 'dreamy' | 'positive' | 'negative' | 'traditional' | 'avant-garde' | 'neutral' | 'romantic' | 'mysterious' | 'adventurous' | 'philosophical' | 'surreal' | ''>('');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');

  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [showFriendlyAlert, setShowFriendlyAlert] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 語音模式狀態
  const [voiceMode, setVoiceMode] = useState<'story' | 'style' | 'generate'>('story');
  const [voiceInstructions, setVoiceInstructions] = useState('點擊麥克風開始語音輸入故事主題');

  // 檢查瀏覽器支援語音辨識
  useEffect(() => {
    const checkSpeechSupport = () => {
      // 更詳細的支援檢查
      const hasWebkitSpeechRecognition = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;
      const hasSpeechRecognition = typeof window !== 'undefined' && 'SpeechRecognition' in window;
      const hasSpeechSupport = hasWebkitSpeechRecognition || hasSpeechRecognition;
      
      console.log('🎤 詳細語音支援檢查:');
      console.log('- typeof window:', typeof window);
      console.log('- webkitSpeechRecognition:', hasWebkitSpeechRecognition);
      console.log('- SpeechRecognition:', hasSpeechRecognition);
      console.log('- 總體支援:', hasSpeechSupport);
      console.log('- navigator.userAgent:', navigator.userAgent);
      console.log('- 當前協議:', window.location.protocol);
      console.log('- 是否為安全上下文:', window.isSecureContext);
      
      // 檢查權限狀態
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'microphone' as any }).then(result => {
          console.log('🎤 麥克風權限狀態:', result.state);
        }).catch(err => {
          console.log('🎤 無法檢查麥克風權限:', err);
        });
      }
      
      // 設置支援狀態
      setIsSpeechSupported(hasSpeechSupport);
      
      // 嘗試初始化
      if (hasSpeechSupport) {
        console.log('🎤 瀏覽器支援語音辨識，開始初始化');
        initSpeechRecognition();
      } else {
        console.log('🎤 瀏覽器不支援語音辨識，嘗試強制初始化');
        // 即使不支援也嘗試初始化（可能會有驚喜）
        setTimeout(() => {
          initSpeechRecognition();
        }, 1000);
      }
    };
    
    // 延遲檢查，確保瀏覽器完全加載
    setTimeout(checkSpeechSupport, 500);
  }, []);

  // 改進語音辨識初始化，支援Chrome和Safari
  const initSpeechRecognition = () => {
    if (typeof window === 'undefined') {
      console.log('🎤 服務器端渲染，跳過初始化');
      return false;
    }

    try {
      // 更靈活的語音辨識檢測
      let SpeechRecognition: any = null;
      
      if ((window as any).webkitSpeechRecognition) {
        SpeechRecognition = (window as any).webkitSpeechRecognition;
        console.log('🎤 使用 webkitSpeechRecognition (Chrome/Edge)');
      } else if ((window as any).SpeechRecognition) {
        SpeechRecognition = (window as any).SpeechRecognition;
        console.log('🎤 使用 SpeechRecognition (Safari/Firefox)');
      } else {
        console.log('🎤 未找到語音辨識支援');
        return false;
      }
      
      // 創建實例
      recognitionRef.current = new SpeechRecognition();
      console.log('🎤 語音辨識實例創建成功');
      
      // 基本配置
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      
      // 語言設置（更靈活）
      const languages = ['zh-TW', 'zh-CN', 'zh', 'en-US', 'en'];
      let langSet = false;
      
      for (const lang of languages) {
        try {
          recognitionRef.current.lang = lang;
          console.log(`🎤 語言設置成功: ${lang}`);
          langSet = true;
          break;
        } catch (e) {
          console.log(`🎤 語言設置失敗: ${lang}`, e);
        }
      }
      
      if (!langSet) {
        console.log('🎤 無法設置語言，使用預設');
      }
      
      // 設置語音識別事件處理器
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('🎤 正在聆聽...');
        console.log('🎤 語音辨識開始，isListening:', true);
        console.log('🎤 瀏覽器類型:', navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari/其他');
        
        // 限制總聆聽時間為10秒（只在沒有語音輸入時觸發）
        const timeoutId = setTimeout(() => {
          // 檢查是否有語音結果，如果沒有才超時
          if (!recognitionRef.current?.results || recognitionRef.current.results.length === 0) {
            console.log('🎤 10秒無語音輸入，自動停止');
            // 強制停止語音識別
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (error) {
                console.error('🎤 超時停止語音識別失敗:', error);
              }
            }
            // 強制重置狀態
            setIsListening(false);
            setTranscript('⏰ 聆聽時間到，請重新點擊麥克風');
            setVoiceMode('story');
            setVoiceInstructions('點擊麥克風開始語音輸入故事主題');
          }
        }, 10000);
        
        // 儲存超時ID以便清理
        (recognitionRef.current as any).timeoutId = timeoutId;
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        console.log('🎤 語音辨識結果:', transcript);
        
        // 清理超時計時器，因為有語音輸入
        if ((recognitionRef.current as any).timeoutId) {
          clearTimeout((recognitionRef.current as any).timeoutId);
          (recognitionRef.current as any).timeoutId = null;
          console.log('🎤 語音輸入成功，清理超時計時器');
        }
        
        // 根據語音模式處理不同的語音指令
        handleVoiceCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('🎤 語音辨識錯誤:', event.error);
        setTranscript(`❌ 語音辨識錯誤: ${event.error}`);
        setIsListening(false);
        
        // 清理超時計時器
        if ((recognitionRef.current as any).timeoutId) {
          clearTimeout((recognitionRef.current as any).timeoutId);
        }
        
        // 錯誤後重置語音模式
        setTimeout(() => {
          setVoiceMode('story');
          setVoiceInstructions('點擊麥克風開始語音輸入故事主題');
          setTranscript('');
        }, 2000);
      };

      recognitionRef.current.onend = () => {
        console.log('🎤 語音辨識結束');
        
        // 清理超時計時器
        if ((recognitionRef.current as any).timeoutId) {
          clearTimeout((recognitionRef.current as any).timeoutId);
          (recognitionRef.current as any).timeoutId = null;
        }
        
        // 立即重置狀態
        setIsListening(false);
        setTranscript('');
        
        // 防止重複觸發
        setTimeout(() => {
          setIsListening(false);
        }, 50);
        
        console.log('🎤 狀態已重置');
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
        // 停止語音識別，不自動繼續
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (error) {
            console.error('🎤 停止語音識別失敗:', error);
          }
        }
        setIsListening(false);
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
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('🎤 自動繼續聆聽失敗:', error);
                setTranscript('❌ 自動繼續聆聽失敗，請手動點擊麥克風');
              }
            }
          }, 1000);
        } else {
          setTranscript(`❌ 未識別風格: ${transcript}，請重試`);
          // 風格識別失敗，繼續聆聽風格選擇
          setTimeout(() => {
            if (recognitionRef.current && !isListening) {
              console.log('🎤 風格識別失敗，繼續聆聽');
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('🎤 自動繼續聆聽失敗:', error);
                setTranscript('❌ 自動繼續聆聽失敗，請手動點擊麥克風');
              }
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
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('🎤 自動繼續聆聽失敗:', error);
                setTranscript('❌ 自動繼續聆聽失敗，請手動點擊麥克風');
              }
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
      // 基礎風格
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
      '溫馨': 'cute',
      
      // 通勤族常用風格同義詞
      '暖心': 'healing',
      '激勵': 'passion',
      '正能量': 'positive',
      '開心': 'funny',
      '快樂': 'funny',
      '幽默': 'funny',
      '有趣': 'funny',
      '驚悚': 'mystery',
      '懸疑': 'mystery',
      '刺激': 'adventurous',
      '科幻': 'surreal',
      '未來': 'surreal',
      '復古': 'traditional',
      '經典': 'traditional',
      '現代': 'avant-garde',
      '創新': 'avant-garde',
      '文藝': 'elegant',
      '藝術': 'elegant',
      '童話': 'whimsical',
      '魔法': 'whimsical',
      '溫情': 'romantic',
      '愛情': 'romantic',
      '友情': 'healing',
      '親情': 'healing',
      '奮鬥': 'passion',
      '成功': 'positive',
      '希望': 'positive',
      '夢想': 'dreamy',
      '理想': 'dreamy',
      '現實': 'raw',
      '真實': 'raw',
      '平衡': 'neutral',
      '和諧': 'neutral',
      '深度': 'philosophical',
      '思考': 'philosophical',
      '智慧': 'philosophical'
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
    // 安全檢查：如果已經在聆聽，直接返回
    if (isListening) {
      console.log('🎤 已經在聆聽中，忽略重複點擊');
      return;
    }
    
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
      setIsListening(false);
    }
  };

  // 停止語音輸入
  const stopVoiceInput = () => {
    console.log('🎤 開始停止語音輸入，當前狀態:', { isListening, voiceMode });
    
    if (recognitionRef.current) {
      try {
        // 清理超時計時器
        if ((recognitionRef.current as any).timeoutId) {
          clearTimeout((recognitionRef.current as any).timeoutId);
          (recognitionRef.current as any).timeoutId = null;
          console.log('🎤 超時計時器已清理');
        }
        
        recognitionRef.current.stop();
        console.log('🎤 語音識別已停止');
      } catch (error) {
        console.error('🎤 停止語音辨識失敗:', error);
      }
    }
    
    // 強制重置狀態
    setIsListening(false);
    setTranscript('');
    
    // 重置語音模式到初始狀態
    setVoiceMode('story');
    setVoiceInstructions('點擊麥克風開始語音輸入故事主題');
    
    console.log('🎤 語音狀態已重置完成');
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
    
    // 檢查語音識別狀態
    if (isListening) {
      console.log('🎤 語音識別正在進行中，強制停止');
      stopVoiceInput();
    }
    
    if (!mood.trim()) {
      console.log('Mood is empty, showing alert');
      alert('請輸入你的心情');
      return;
    }

    const payload: GeneratePayload = {
      mood: mood.trim(),
      style: style || undefined,
      voiceGender,
    };

    console.log('Submitting payload:', payload);
    console.log('Calling onSubmit function...');
    
    try {
      await onSubmit(payload);
      console.log('onSubmit completed successfully');
    } catch (error: any) {
      console.error('onSubmit failed:', error);
      
      // 檢查是否為內容政策違規或其他需要友善提示的錯誤
      console.log('🔍 錯誤分析:', {
        errorMessage: error.message,
        errorType: error.constructor.name,
        fullError: error
      });
      
      const shouldShowFriendlyAlert = error.message && (
        error.message.includes('內容政策違規') || 
        error.message.includes('不當內容') ||
        error.message.includes('適當的故事主題') ||
        error.message.includes('生成失敗') ||
        error.message.includes('Internal server error') ||
        error.message.includes('故事生成失敗')
      );
      
      console.log('🎯 是否顯示友善提示:', shouldShowFriendlyAlert);
      
      if (shouldShowFriendlyAlert) {
        console.log('🎯 顯示友善提示');
        setShowFriendlyAlert(true);
      } else {
        // 其他錯誤顯示一般提示
        console.log('⚠️ 顯示一般錯誤提示');
        alert('提交失敗，請重試');
      }
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 shadow-lg">
        <div className="text-center mb-3">
          <h2 className="text-xl font-bold text-blue-800 mb-1">🎤 通勤族專屬語音操作</h2>
          <p className="text-sm text-blue-600">語音輸入故事主題，5分鐘完成專屬4格語音漫畫！</p>
        </div>
        
        <div className="flex justify-center">
          {/* 語音輸入步驟 */}
          <div className="bg-white rounded-lg p-4 border-2 border-blue-300 shadow-md max-w-sm">
            <div className="text-center">
              <h3 className="font-bold text-blue-800 mb-2">語音輸入故事主題</h3>
              <p className="text-sm text-gray-600 mb-3 flex items-center justify-center gap-1">
                點擊下面
                <span className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center text-xs font-bold">🎤</span>
                說出你的故事想法
              </p>
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="text-sm text-blue-700 font-medium mb-2">通勤族常用主題：</p>
                <p className="text-sm text-blue-600">「地鐵奇遇」「辦公室日常」「通勤路上」「咖啡廳故事」......</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-3">
          <p className="text-[13px] text-blue-700 font-medium">🚇 專為通勤族設計，語音輸入故事主題，快速生成語音漫畫！</p>
        </div>
      </div>

      {/* 故事主題輸入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-purple-400 sm:text-purple-700 sm:dark:text-purple-300">故事主題 *</label>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="例如：地鐵奇遇、辦公室日常、通勤路上、咖啡廳故事、地鐵站偶遇、公車上的故事、捷運奇緣、通勤時光..."
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            maxLength={20}
            className="w-full border-purple-300 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-600 text-black sm:text-black placeholder:text-gray-500"
            disabled={isLoading}
          />
          <Button
            type="button"
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            disabled={isLoading}
            className={cn(
              "px-3 py-2 border-0 shadow-lg touch-manipulation flex-shrink-0",
              isListening 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-blue-500 hover:bg-blue-600 text-white"
            )}
            onTouchEnd={(e) => {
              e.preventDefault();
              if (!isLoading) {
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
          <p className="font-medium">🎤 語音操作：說故事主題</p>
          <p className="mt-1 text-gray-600">💡 例如：地鐵奇遇、辦公室日常、通勤路上、咖啡廳故事</p>
        </div>
        
        {/* 語音狀態顯示 */}
        {transcript && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded-md border border-green-200">
            {transcript}
          </div>
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
          <option value="" className="text-white">選擇風格</option>
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
        
        
        {/* 語音性別選擇 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-purple-400 sm:text-purple-700 sm:dark:text-purple-300">語音性別</label>
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={() => setVoiceGender('male')}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                voiceGender === 'male'
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              )}
            >
              🧑 男聲
            </Button>
            <Button
              type="button"
              onClick={() => setVoiceGender('female')}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                voiceGender === 'female'
                  ? "bg-pink-600 hover:bg-pink-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              )}
            >
              👩 女聲
            </Button>
          </div>
          <p className="text-xs text-gray-500">選擇故事講述的語音性別</p>
        </div>
        

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
          "🚇 生成我的4格語音漫畫故事"
        )}
      </Button>
      

      {/* 提示信息 */}
      <div className="text-center text-xs text-blue-700 dark:text-blue-400 space-y-1">
        <p>🚇 專為通勤族設計的4格語音漫畫生成器</p>
        <p>⏱️ 5分鐘快速生成，適合碎片時間</p>
        <p>🎨 每格都包含精美插圖和完整故事內容</p>
        <p className="text-purple-600 font-medium">🎤 支援語音輸入故事主題</p>
        <p className="text-green-600 font-medium">💡 每天通勤路上，讓AI為你畫一篇專屬語音漫畫！</p>
      </div>
      
      {/* 友善提示組件 */}
      <FriendlyAlert
        isOpen={showFriendlyAlert}
        onClose={() => setShowFriendlyAlert(false)}
        onRetry={() => {
          setShowFriendlyAlert(false);
          setMood('');
          setStyle('');
          resetVoiceMode();
        }}
        onSelectSuggestion={(suggestion) => {
          setMood(suggestion);
          setShowFriendlyAlert(false);
          resetVoiceMode();
        }}
      />
    </form>
  );
}
