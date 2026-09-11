import React from 'react';
import { useAudio } from '../../context/AudioContext';
import {
  CloudRain,
  Coffee,
  Activity,
  Radio,
  Trees,
  Sliders,
  Volume2,
  PowerOff,
} from 'lucide-react';

export const AmbientSoundMixer: React.FC = () => {
  const {
    ambientLayers,
    toggleAmbientLayer,
    setAmbientLayerVolume,
    stopAllAmbient,
  } = useAudio();

  const getLayerIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain':
        return <CloudRain className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'Activity':
        return <Activity className="w-4 h-4" />;
      case 'Radio':
        return <Radio className="w-4 h-4" />;
      case 'Trees':
        return <Trees className="w-4 h-4" />;
      default:
        return <Volume2 className="w-4 h-4" />;
    }
  };

  const activeCount = ambientLayers.filter((l) => l.isEnabled).length;

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Multi-Layer Ambient Mixer
          </span>
          <p className="text-xs text-slate-400 mt-0.5">Blend background atmosphere with your music</p>
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={stopAllAmbient}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-red-400 bg-red-950/30 border border-red-800/40 hover:bg-red-900/40 transition-colors"
          >
            <PowerOff className="w-3 h-3" /> Mute Ambient
          </button>
        )}
      </div>

      {/* Layer Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {ambientLayers.map((layer) => {
          return (
            <div
              key={layer.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                layer.isEnabled
                  ? 'bg-indigo-950/40 border-indigo-500/40 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => toggleAmbientLayer(layer.id)}
                  className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                    layer.isEnabled ? 'text-indigo-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${
                      layer.isEnabled
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {getLayerIcon(layer.icon)}
                  </div>
                  <span>{layer.name}</span>
                </button>

                {layer.isEnabled && (
                  <span className="text-[10px] font-bold text-indigo-400 font-mono">
                    {layer.volume}%
                  </span>
                )}
              </div>

              {/* Volume Slider for layer */}
              <input
                type="range"
                min="0"
                max="100"
                value={layer.volume}
                disabled={!layer.isEnabled}
                onChange={(e) => setAmbientLayerVolume(layer.id, Number(e.target.value))}
                className={`w-full h-1 rounded-lg cursor-pointer transition-opacity ${
                  layer.isEnabled
                    ? 'accent-indigo-500 bg-slate-700'
                    : 'opacity-30 bg-slate-800 cursor-not-allowed'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
