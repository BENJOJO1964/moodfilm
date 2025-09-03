import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PanelCard } from '@/components/PanelCard';
import { GenerateResponse } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ComicPlayerProps {
  data: GenerateResponse;
  onRestart?: () => void;
  className?: string;
}

export function ComicPlayer({ data, onRestart, className }: ComicPlayerProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* 標題和元數據 */}
      <div className="text-center space-y-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 backdrop-blur-sm">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">你的心情漫畫</h2>
        <p className="text-blue-700 dark:text-blue-300">
          心情: {data.meta.mood} | 
          風格: {data.meta.style || '治癒'}
        </p>
        
        {/* 重新開始按鈕 */}
        {onRestart && (
          <div className="mt-4">
            <Button
              onClick={onRestart}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-md"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新輸入心情
            </Button>
          </div>
        )}
      </div>

      {/* 漫畫格子 */}
      <div className="space-y-4">
        {data.panels.map((panel, index) => (
          <div
            key={panel.index}
            className="transition-all duration-500 block opacity-100 scale-100"
          >
            <PanelCard
              panel={panel}
              isActive={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
