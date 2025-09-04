import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lightbulb, Heart, Coffee, Train } from 'lucide-react';

interface FriendlyAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSelectSuggestion?: (suggestion: string) => void;
}

export function FriendlyAlert({ isOpen, onClose, onRetry, onSelectSuggestion }: FriendlyAlertProps) {
  if (!isOpen) return null;

  const suggestions = [
    { icon: Train, text: '地鐵奇遇', emoji: '🚇' },
    { icon: Coffee, text: '咖啡廳故事', emoji: '☕' },
    { icon: Heart, text: '溫馨日常', emoji: '💕' },
    { icon: Lightbulb, text: '創意靈感', emoji: '💡' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
        {/* 頭部圖標 */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            讓我們一起創造美好的故事 ✨
          </h3>
        </div>

        {/* 主要內容 */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            為了創造適合所有年齡層的內容，我們建議使用正面、有趣的主題。
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-3">
              💡 推薦故事主題：
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-white rounded-lg p-2 border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    if (onSelectSuggestion) {
                      onSelectSuggestion(suggestion.text);
                    }
                    onClose();
                  }}
                >
                  <span className="text-lg">{suggestion.emoji}</span>
                  <span className="text-sm text-blue-700">{suggestion.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            關閉
          </Button>
          <Button
            onClick={onRetry}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            重新輸入
          </Button>
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            🚇 專為通勤族設計 • 創造正能量故事
          </p>
        </div>
      </div>
    </div>
  );
}
