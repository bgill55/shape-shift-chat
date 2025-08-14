
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export function AudioPlayer({ src, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1); // New state for volume (0 to 1)
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    // Set initial volume and update when volume state changes
    audio.volume = volume;

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume]); // Add volume to dependency array

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = e.currentTarget;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className={`flex items-center space-x-3 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-3 max-w-xs ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <Button
        onClick={togglePlay}
        size="sm"
        className="bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] w-8 h-8 p-0"
      >
        {isPlaying ? <Pause className="w-4 h-4" aria-label="Pause audio" /> : <Play className="w-4 h-4" aria-label="Play audio" />}
      </Button>

      <div className="flex-1 space-y-1">
        <div 
          className="w-full h-2 bg-[rgb(var(--muted))] rounded-full cursor-pointer relative"
          onClick={handleSeek}
          role="progressbar"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-label="Audio progress bar"
        >
          <div 
            className="h-full bg-[rgb(var(--primary))] rounded-full"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-[rgb(var(--muted-foreground))]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] w-8 h-8 p-0">
            <Volume2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[rgb(var(--card))] border-[rgb(var(--border))]">
          <Slider
            orientation="vertical"
            defaultValue={[100]}
            max={100}
            step={1}
            className="w-auto h-[100px] p-2"
            onValueChange={(val) => setVolume(val[0] / 100)}
            aria-label="Volume control"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
