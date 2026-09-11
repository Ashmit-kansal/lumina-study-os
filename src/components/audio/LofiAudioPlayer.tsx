import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  Radio,
  Disc3,
  ListMusic,
  Sparkles,
} from 'lucide-react';

export const LofiAudioPlayer: React.FC = () => {
  const {
    tracks,
    currentTrack,
    isPlayingLofi,
    toggleLofi,
    nextTrack,
    prevTrack,
    selectTrack,
    lofiVolume,
    setLofiVolume,
    isMuted,
    toggleMute,
  } = useAudio();

  const [showTrackList, setShowTrackList] = useState(false);

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 relative overflow-hidden shadow-xl">
      {/* Background Subtle Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Track Info & Visualizer */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 shadow-lg ${isPlayingLofi ? 'shadow-indigo-500/20' : ''}`}>
              <Disc3 className={`w-7 h-7 text-indigo-400 ${isPlayingLofi ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            </div>

            {/* Live Visualizer Waves */}
            {isPlayingLofi && (
              <div className="absolute -bottom-1 -right-1 flex items-end gap-0.5 bg-slate-950/90 px-1.5 py-1 rounded-md border border-indigo-500/30">
                <div className="w-1 bg-indigo-400 rounded-full wave-bar-1" />
                <div className="w-1 bg-indigo-400 rounded-full wave-bar-2" />
                <div className="w-1 bg-indigo-400 rounded-full wave-bar-3" />
                <div className="w-1 bg-indigo-400 rounded-full wave-bar-4" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                <Music className="w-3 h-3" /> Copyright-Free Lo-Fi Station
              </span>
              {currentTrack.isSynthetic && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> 432Hz Synth
                </span>
              )}
            </div>
            <h4 className="text-base font-semibold text-slate-100 mt-0.5 line-clamp-1">{currentTrack.title}</h4>
            <p className="text-xs text-slate-400">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevTrack}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleLofi}
              className={`p-3.5 rounded-2xl font-semibold transition-all transform active:scale-95 shadow-lg ${
                isPlayingLofi
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white border border-slate-700'
              }`}
              title={isPlayingLofi ? 'Pause Music' : 'Play Lo-Fi Music'}
            >
              {isPlayingLofi ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800">
            <button type="button" onClick={toggleMute} className="text-slate-400 hover:text-slate-200">
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : lofiVolume}
              onChange={(e) => setLofiVolume(Number(e.target.value))}
              className="w-20 accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Track List Toggle */}
          <button
            type="button"
            onClick={() => setShowTrackList(!showTrackList)}
            className={`p-2.5 rounded-xl border transition-colors ${
              showTrackList
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Select Track"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Track List */}
      {showTrackList && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-1.5 max-h-48 overflow-y-auto">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Available Soothing Tracks
          </span>
          {tracks.map((track) => {
            const isSelected = track.id === currentTrack.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  selectTrack(track);
                  setShowTrackList(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                  isSelected
                    ? 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-200'
                    : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Radio className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="font-medium block">{track.title}</span>
                    <span className="text-[10px] text-slate-400">{track.artist}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{track.duration}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
