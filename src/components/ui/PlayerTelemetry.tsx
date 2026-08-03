import { useSimulationStore } from '../../store/useSimulationStore';
import { Activity, Heart, Zap, Footprints, X } from 'lucide-react';

export const PlayerTelemetry = () => {
  const selectedPlayerId = useSimulationStore(state => state.selectedPlayerId);
  const players = useSimulationStore(state => state.players);
  const ball = useSimulationStore(state => state.ball);
  const setSelectedPlayer = useSimulationStore(state => state.setSelectedPlayer);

  const player = players.find(p => p.id === selectedPlayerId);

  if (!player) return null;

  const speed = Math.sqrt(player.velocity[0]*player.velocity[0] + player.velocity[2]*player.velocity[2]);
  const teamColor = player.team === 'A' ? 'text-neon-cyan' : 'text-neon-magenta';

  return (
    <div className="fixed right-6 top-24 bg-slate-900/80 backdrop-blur border border-magenta-500/30 rounded-xl p-4 pointer-events-auto flex flex-col gap-4 w-80 font-mono">
      <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.1)] pb-2">
        <div>
          <h2 className={`font-display font-bold text-2xl ${teamColor}`}>{player.name}</h2>
          <span className="text-text-muted text-sm">#{player.number} | Team {player.team}</span>
        </div>
        <button onClick={() => setSelectedPlayer(null)} className="text-text-muted hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Speed */}
        <div className="bg-[rgba(0,0,0,0.3)] p-3 rounded border border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-2 text-text-muted mb-1 text-xs"><Zap size={14} /> SPEED</div>
          <div className="font-display text-xl">{speed.toFixed(1)} <span className="text-xs text-text-muted">m/s</span></div>
        </div>

        {/* Heart Rate */}
        <div className="bg-[rgba(0,0,0,0.3)] p-3 rounded border border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-2 text-text-muted mb-1 text-xs"><Heart size={14} className="text-red-500" /> HR</div>
          <div className="font-display text-xl">{Math.round(player.biometrics.heartRate)} <span className="text-xs text-text-muted">bpm</span></div>
        </div>

        {/* Fatigue */}
        <div className="bg-[rgba(0,0,0,0.3)] p-3 rounded border border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-2 text-text-muted mb-1 text-xs"><Activity size={14} className="text-neon-orange" /> FATIGUE</div>
          <div className="font-display text-xl">{Math.round(player.biometrics.fatigue)}<span className="text-xs text-text-muted">%</span></div>
          <div className="progress-container mt-2 h-1">
            <div className="progress-bar bg-neon-orange" style={{ width: `${player.biometrics.fatigue}%` }}></div>
          </div>
        </div>

        {/* Stride Impact */}
        <div className="bg-[rgba(0,0,0,0.3)] p-3 rounded border border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-2 text-text-muted mb-1 text-xs"><Footprints size={14} /> IMPACT</div>
          <div className="font-display text-xl">{Math.round(player.biometrics.strideImpact)} <span className="text-xs text-text-muted">N</span></div>
        </div>
      </div>

      {player.isPossessing && (
        <div className="mt-2 p-2 bg-[rgba(0,255,102,0.1)] border border-neon-green text-neon-green text-center text-xs font-bold rounded animate-pulse">
          BALL POSSESSION
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
        <div className="text-xs text-text-muted mb-2 font-sans tracking-widest">BALL SENSORS</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[rgba(0,0,0,0.3)] p-3 rounded border border-orange-500/30">
            <div className="text-xs text-orange-500 mb-1">IMPACT</div>
            <div className="text-xl">{Math.round(ball.impactForce)} <span className="text-xs text-text-muted">N</span></div>
          </div>
          <div className="bg-[rgba(0,0,0,0.3)] p-3 rounded border border-cyan-500/30">
            <div className="text-xs text-cyan-500 mb-1">SPIN</div>
            <div className="text-xl">{Math.round(ball.spin)} <span className="text-xs text-text-muted">RPM</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
