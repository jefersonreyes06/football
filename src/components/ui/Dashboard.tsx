import { useSimulationStore } from '../../store/useSimulationStore';

export const Dashboard = () => {
  const matchStats = useSimulationStore(state => state.matchStats);
  const { teamA, teamB } = matchStats.winProbability;

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 rounded-xl p-4 pointer-events-auto w-[600px] mx-auto flex flex-col">
      <div className="flex justify-center items-center mb-4 gap-6">
        <div className="text-cyan font-display font-bold text-3xl glow-cyan text-right w-32">HON</div>
        <div className="text-white font-display font-bold text-4xl tracking-widest bg-black/50 px-4 py-2 rounded-lg border border-white/10">
          {matchStats.score.teamA} - {matchStats.score.teamB}
        </div>
        <div className="text-magenta font-display font-bold text-3xl glow-magenta text-left w-32">PAN</div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-cyan font-display font-bold text-sm glow-cyan">HONDURAS</div>
        <div className="text-xs text-text-muted font-display tracking-widest">WIN PROBABILITY</div>
        <div className="text-magenta font-display font-bold text-sm glow-magenta">PANAMÁ</div>
      </div>
      
      <div className="flex justify-between text-lg font-bold mb-1">
        <span className="text-cyan">{teamA}%</span>
        <span className="text-magenta">{teamB}%</span>
      </div>

      <div className="progress-container flex">
        <div className="progress-bar bg-neon-cyan" style={{ width: `${teamA}%` }}></div>
        <div className="progress-bar bg-neon-magenta" style={{ width: `${teamB}%` }}></div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-text-muted">
        <div>POSSESSION: {Math.round(matchStats.possessionTicks.teamA / Math.max(1, (matchStats.possessionTicks.teamA + matchStats.possessionTicks.teamB)) * 100)}%</div>
        <div>POSSESSION: {Math.round(matchStats.possessionTicks.teamB / Math.max(1, (matchStats.possessionTicks.teamA + matchStats.possessionTicks.teamB)) * 100)}%</div>
      </div>
    </div>
  );
};
