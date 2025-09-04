import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

export function VoiceTest() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);

  const startVoiceInput = () => {
    try {
      // 檢查瀏覽器支援
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setError('瀏覽器不支援語音辨識');
        return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-TW';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('🎤 正在聆聽...');
        setError('');
      };

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(`✅ 識別結果: ${result}`);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        setError(`語音辨識錯誤: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } catch (err) {
      setError(`啟動失敗: ${err}`);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border">
      <h3 className="text-lg font-bold mb-4">🎤 語音功能測試</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Button
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            className={isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
          >
            {isListening ? '🔴 停止' : '🎤 開始語音'}
          </Button>
        </div>

        {transcript && (
          <div className="p-3 bg-green-100 rounded border">
            <p className="text-green-800">{transcript}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 rounded border">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>狀態: {isListening ? '聆聽中...' : '待機'}</p>
          <p>支援: {'webkitSpeechRecognition' in window || 'SpeechRecognition' in window ? '✅ 支援' : '❌ 不支援'}</p>
        </div>
      </div>
    </div>
  );
}
