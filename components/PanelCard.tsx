import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ComicPanel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PanelCardProps {
  panel: ComicPanel;
  className?: string;
  isActive?: boolean;
}

export function PanelCard({ panel, className, isActive = false }: PanelCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMuteToggle = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    console.error('Audio playback error');
    setIsPlaying(false);
  };



  return (
    <div className={cn(
      "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:via-indigo-950/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 space-y-6 shadow-lg backdrop-blur-sm",
      isActive && "ring-2 ring-blue-400 ring-offset-4 shadow-xl scale-105",
      className
    )}>
      {/* 標題 */}
      <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {panel.title || `第 ${panel.index + 1} 格`}
      </h3>

      {/* 圖片區域 - 放大版本 */}
      <div className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-500",
        isActive ? "aspect-video w-full" : "aspect-square w-full"
      )}>
        {panel.image_b64 ? (
          <img
            src={panel.image_b64}
            alt={panel.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              isActive ? "scale-110" : "scale-100"
            )}
          />
        ) : (
          <LoadingSkeleton type="image" />
        )}
      </div>

      {/* 語音播放控制 */}
      {panel.audio_b64 && (
        <div className="bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center">
              <Button
                onClick={handlePlayPause}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>暫停</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>播放故事</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* 隱藏的音頻元素 */}
          <audio
            ref={audioRef}
            src={panel.audio_b64}
            onEnded={handleAudioEnded}
            onError={handleAudioError}
            preload="metadata"
          />
        </div>
      )}

      {/* 橫式文字區域 */}
      <div className="space-y-3">
        {/* 旁白 */}
        {panel.narration && (
          <div className="bg-gradient-to-r from-blue-100/50 to-indigo-100/50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 backdrop-blur-sm">
            <p className="text-base leading-relaxed text-blue-800 dark:text-blue-200">
              {panel.narration}
            </p>
          </div>
        )}
        
        {/* 對話 */}
        {panel.dialogue && (
          <div className="bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border-l-4 border-purple-400 dark:border-purple-600 backdrop-blur-sm">
            <p className="text-base font-medium text-purple-800 dark:text-purple-200">
              "{panel.dialogue}"
            </p>
          </div>
        )}
      </div>

      {/* 持續時間 */}
      <p className="text-sm text-blue-600 dark:text-blue-400 text-center font-medium">
        建議觀看時間: {panel.duration_sec} 秒
      </p>
    </div>
  );
}
