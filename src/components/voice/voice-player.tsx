'use client';

import { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoicePlayerProps {
  audioUrl?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  compact?: boolean;
  showDownload?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export function VoicePlayer({
  audioUrl,
  title,
  subtitle,
  loading,
  className,
  compact = false,
  showDownload = true,
  autoPlay = false,
  onEnded,
}: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onEnded]);

  useEffect(() => {
    if (audioUrl && autoPlay && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [audioUrl, autoPlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = title ? `${title.replace(/\s+/g, '_')}.mp3` : 'audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={togglePlay}
          disabled={loading || !audioUrl}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        {title && (
          <span className="text-sm text-muted-foreground truncate">{title}</span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-muted/50 rounded-lg p-4 border',
        className
      )}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Title and subtitle */}
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h4 className="font-medium text-sm">{title}</h4>}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-muted-foreground w-10">
          {formatTime(currentTime)}
        </span>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          disabled={!audioUrl || loading}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-10">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={restart}
                  disabled={!audioUrl || loading}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Restart</TooltipContent>
            </Tooltip>

            <Button
              variant="default"
              size="sm"
              onClick={togglePlay}
              disabled={!audioUrl || loading}
              className="px-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </>
              )}
            </Button>

            {showDownload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleDownload}
                    disabled={!audioUrl || loading}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleMute}
            disabled={!audioUrl || loading}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            disabled={!audioUrl || loading}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}
