import { useSimulationStore } from '../../store/useSimulationStore';
import { Play, Pause, Camera, Crosshair, FastForward } from 'lucide-react';

export const Controls = () => {
  const isPlaying = useSimulationStore(state => state.isPlaying);
  const togglePlay = useSimulationStore(state => state.togglePlay);
  const speedMultiplier = useSimulationStore(state => state.speedMultiplier);
  const setSpeedMultiplier = useSimulationStore(state => state.setSpeedMultiplier);
  const cameraMode = useSimulationStore(state => state.cameraMode);
  const setCameraMode = useSimulationStore(state => state.setCameraMode);

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 rounded-xl p-4 pointer-events-auto mx-auto flex gap-4 items-center">
      <button 
        onClick={togglePlay}
        className="p-3 rounded bg-[rgba(0,255,255,0.1)] hover:bg-[rgba(0,255,255,0.2)] border border-[rgba(0,255,255,0.3)] transition-colors text-neon-cyan"
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>

      <div className="w-px h-8 bg-[rgba(255,255,255,0.2)] mx-2"></div>

      <div className="flex gap-2">
        <button 
          onClick={() => setCameraMode('free')}
          className={`p-2 rounded flex items-center gap-2 border transition-colors ${cameraMode === 'free' ? 'bg-[rgba(0,255,255,0.2)] border-neon-cyan text-neon-cyan' : 'bg-transparent border-[rgba(255,255,255,0.2)] text-text-muted hover:text-white'}`}
        >
          <Camera size={16} /> Free
        </button>
        <button 
          onClick={() => setCameraMode('ball')}
          className={`p-2 rounded flex items-center gap-2 border transition-colors ${cameraMode === 'ball' ? 'bg-[rgba(0,255,255,0.2)] border-neon-cyan text-neon-cyan' : 'bg-transparent border-[rgba(255,255,255,0.2)] text-text-muted hover:text-white'}`}
        >
          <Crosshair size={16} /> Ball
        </button>
        <button 
          onClick={() => setCameraMode('ar')}
          className={`p-2 rounded flex items-center gap-2 border transition-colors ${cameraMode === 'ar' ? 'bg-[rgba(255,0,255,0.2)] border-neon-magenta text-neon-magenta glow-magenta' : 'bg-transparent border-[rgba(255,255,255,0.2)] text-text-muted hover:text-white'}`}
        >
          <Camera size={16} /> AR HUD
        </button>
      </div>

      <div className="w-px h-8 bg-[rgba(255,255,255,0.2)] mx-2"></div>

      <button 
        onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 2 : 1)}
        className={`p-2 rounded flex items-center gap-2 border transition-colors ${speedMultiplier > 1 ? 'bg-[rgba(0,255,102,0.2)] border-neon-green text-neon-green' : 'bg-transparent border-[rgba(255,255,255,0.2)] text-text-muted hover:text-white'}`}
      >
        <FastForward size={16} /> {speedMultiplier}x
      </button>
    </div>
  );
};
