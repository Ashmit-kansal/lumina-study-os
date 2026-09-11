import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioTrack, AmbientLayer } from '../types';
import { SEED_AUDIO_TRACKS, INITIAL_AMBIENT_LAYERS } from '../utils/seedData';
import { soundSynthesizer } from '../services/soundSynthesizer';

interface AudioContextType {
  tracks: AudioTrack[];
  currentTrack: AudioTrack;
  isPlayingLofi: boolean;
  lofiVolume: number;
  playLofi: () => void;
  pauseLofi: () => void;
  toggleLofi: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  selectTrack: (track: AudioTrack) => void;
  setLofiVolume: (vol: number) => void;

  // Ambient Layering
  ambientLayers: AmbientLayer[];
  toggleAmbientLayer: (id: string) => void;
  setAmbientLayerVolume: (id: string, volume: number) => void;
  stopAllAmbient: () => void;

  // Master Volume
  masterVolume: number;
  setMasterVolume: (vol: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks] = useState<AudioTrack[]>(SEED_AUDIO_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlayingLofi, setIsPlayingLofi] = useState<boolean>(false);
  const [lofiVolume, setLofiVolume] = useState<number>(65);
  const [ambientLayers, setAmbientLayers] = useState<AmbientLayer[]>(INITIAL_AMBIENT_LAYERS);
  const [masterVolume, setMasterVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Initialize standard audio element
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current) {
      if (currentTrack.isSynthetic) {
        audioRef.current.pause();
        if (isPlayingLofi) {
          soundSynthesizer.startAmbientLayer('binaural', (lofiVolume * (isMuted ? 0 : masterVolume)) / 100);
        }
      } else if (currentTrack.url) {
        soundSynthesizer.stopAmbientLayer('binaural');
        audioRef.current.src = currentTrack.url;
        audioRef.current.volume = isMuted ? 0 : (lofiVolume / 100) * (masterVolume / 100);
        if (isPlayingLofi) {
          audioRef.current.play().catch(() => {
            // Autoplay prevention fallback
            setIsPlayingLofi(false);
          });
        }
      }
    }
  }, [currentTrackIndex, currentTrack]);

  // Adjust volume
  useEffect(() => {
    if (audioRef.current && !currentTrack.isSynthetic) {
      audioRef.current.volume = isMuted ? 0 : (lofiVolume / 100) * (masterVolume / 100);
    }
  }, [lofiVolume, masterVolume, isMuted, currentTrack]);

  const playLofi = () => {
    setIsPlayingLofi(true);
    if (currentTrack.isSynthetic) {
      soundSynthesizer.startAmbientLayer('binaural', (lofiVolume * (isMuted ? 0 : masterVolume)) / 100);
    } else if (audioRef.current && currentTrack.url) {
      audioRef.current.play().catch(() => {
        setIsPlayingLofi(false);
      });
    }
  };

  const pauseLofi = () => {
    setIsPlayingLofi(false);
    if (currentTrack.isSynthetic) {
      soundSynthesizer.stopAmbientLayer('binaural');
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleLofi = () => {
    if (isPlayingLofi) {
      pauseLofi();
    } else {
      playLofi();
    }
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIdx);
  };

  const prevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
  };

  const selectTrack = (track: AudioTrack) => {
    const idx = tracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setIsPlayingLofi(true);
    }
  };

  // Ambient Layer Toggles
  const toggleAmbientLayer = (id: string) => {
    setAmbientLayers((prev) =>
      prev.map((layer) => {
        if (layer.id === id) {
          const nextEnabled = !layer.isEnabled;
          if (nextEnabled) {
            soundSynthesizer.startAmbientLayer(layer.type, (layer.volume * (isMuted ? 0 : masterVolume)) / 100);
          } else {
            soundSynthesizer.stopAmbientLayer(layer.type);
          }
          return { ...layer, isEnabled: nextEnabled };
        }
        return layer;
      })
    );
  };

  const setAmbientLayerVolume = (id: string, volume: number) => {
    setAmbientLayers((prev) =>
      prev.map((layer) => {
        if (layer.id === id) {
          if (layer.isEnabled) {
            soundSynthesizer.updateAmbientVolume(layer.type, (volume * (isMuted ? 0 : masterVolume)) / 100);
          }
          return { ...layer, volume };
        }
        return layer;
      })
    );
  };

  const stopAllAmbient = () => {
    setAmbientLayers((prev) => prev.map((l) => ({ ...l, isEnabled: false })));
    soundSynthesizer.stopAllAmbient();
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <AudioContext.Provider
      value={{
        tracks,
        currentTrack,
        isPlayingLofi,
        lofiVolume,
        playLofi,
        pauseLofi,
        toggleLofi,
        nextTrack,
        prevTrack,
        selectTrack,
        setLofiVolume,
        ambientLayers,
        toggleAmbientLayer,
        setAmbientLayerVolume,
        stopAllAmbient,
        masterVolume,
        setMasterVolume,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
