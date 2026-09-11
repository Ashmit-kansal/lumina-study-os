import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { useRouter } from '../../context/RouterContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
} from 'lucide-react';

interface QuickAudioFloatingBarProps {
  onOpenStudyRoom?: () => void;
}

export const QuickAudioFloatingBar: React.FC<QuickAudioFloatingBarProps> = ({
  onOpenStudyRoom: propOnOpenStudyRoom,
}) => {
  const router = useRouter();
  const onOpenStudyRoom = propOnOpenStudyRoom || (() => router.navigateToTab('rooms'));
  const {
    currentTrack,
    isPlayingLofi,
    toggleLofi,
    lofiVolume,
    setLofiVolume,
    isMuted,
    toggleMute,
  } = useAudio();

  return (
    <div className="fixed bottom-20 md:bottom-5 right-3 md:right-5 z-30 max-w-xs sm:max-w-sm w-full transition-all">
      <div className="glass-panel-glow p-3 rounded-2xl md:rounded-3xl border border-indigo-500/40 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-2.5">
          {/* Track info & mini visualizer */}
          <div
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
            onClick={onOpenStudyRoom}
            title="Go to Study Lounge"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Music className={`w-4 h-4 text-indigo-300 ${isPlayingLofi ? 'animate-pulse' : ''}`} />
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold text-slate-100 truncate block group-hover:text-indigo-300 transition-colors">
                {currentTrack.title}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {currentTrack.artist}
              </span>
            </div>
          </div>

          {/* Quick Play & Volume Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Mini Volume Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={toggleLofi}
              className={`p-2 rounded-xl transition-all active:scale-95 ${
                isPlayingLofi
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white'
              }`}
              title={isPlayingLofi ? 'Pause Lo-Fi' : 'Play Lo-Fi'}
            >
              {isPlayingLofi ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
