'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown, Play, Pause, Loader2, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { elevenLabsApi, type ElevenLabsVoice } from '@/lib/api';

interface VoiceSelectorProps {
  value?: string;
  onValueChange: (voiceId: string, voice: ElevenLabsVoice) => void;
  useCase?: string;
  gender?: string;
  disabled?: boolean;
  className?: string;
}

export function VoiceSelector({
  value,
  onValueChange,
  useCase,
  gender,
  disabled,
  className,
}: VoiceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const selectedVoice = voices.find((v) => v.id === value);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        const response = await elevenLabsApi.getVoices({
          use_case: useCase,
          gender,
        });
        setVoices(response.data.premium_voices || []);
      } catch (error) {
        console.error('Failed to fetch voices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, [useCase, gender]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  const handlePreview = async (e: React.MouseEvent, voice: ElevenLabsVoice) => {
    e.stopPropagation();

    // If already playing this voice, stop it
    if (playingVoiceId === voice.id) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setPlayingVoiceId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
    }

    try {
      setPreviewLoading(voice.id);
      setPlayingVoiceId(null);

      const response = await elevenLabsApi.generatePreview(voice.id);
      const audioUrl = response.data.audio_url;

      const audio = new Audio(audioUrl);
      setAudioElement(audio);

      audio.onended = () => {
        setPlayingVoiceId(null);
      };

      audio.onerror = () => {
        setPlayingVoiceId(null);
        setPreviewLoading(null);
      };

      await audio.play();
      setPlayingVoiceId(voice.id);
    } catch (error) {
      console.error('Failed to play preview:', error);
    } finally {
      setPreviewLoading(null);
    }
  };

  const getUseCaseBadgeColor = (voiceUseCase?: string) => {
    switch (voiceUseCase) {
      case 'sales':
        return 'bg-blue-100 text-blue-800';
      case 'fitness':
        return 'bg-green-100 text-green-800';
      case 'meditation':
        return 'bg-purple-100 text-purple-800';
      case 'coaching':
        return 'bg-orange-100 text-orange-800';
      case 'support':
        return 'bg-yellow-100 text-yellow-800';
      case 'premium':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn('w-full justify-between', className)}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading voices...
            </span>
          ) : selectedVoice ? (
            <span className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              {selectedVoice.name}
              {selectedVoice.use_case && (
                <Badge
                  variant="secondary"
                  className={cn('text-xs', getUseCaseBadgeColor(selectedVoice.use_case))}
                >
                  {selectedVoice.use_case}
                </Badge>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">Select a voice...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search voices..." />
          <CommandList>
            <CommandEmpty>No voices found.</CommandEmpty>
            <CommandGroup>
              {voices.map((voice) => (
                <CommandItem
                  key={voice.id}
                  value={voice.name}
                  onSelect={() => {
                    onValueChange(voice.id, voice);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0',
                        value === voice.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{voice.name}</span>
                        {voice.gender && (
                          <span className="text-xs text-muted-foreground capitalize">
                            ({voice.gender})
                          </span>
                        )}
                      </div>
                      {voice.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {voice.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        {voice.use_case && (
                          <Badge
                            variant="secondary"
                            className={cn('text-xs', getUseCaseBadgeColor(voice.use_case))}
                          >
                            {voice.use_case}
                          </Badge>
                        )}
                        {voice.accent && (
                          <Badge variant="outline" className="text-xs">
                            {voice.accent}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 ml-2"
                    onClick={(e) => handlePreview(e, voice)}
                    disabled={previewLoading === voice.id}
                  >
                    {previewLoading === voice.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : playingVoiceId === voice.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
