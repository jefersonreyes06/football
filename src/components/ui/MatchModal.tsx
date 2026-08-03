import { useSimulationStore } from '../../store/useSimulationStore';

export const MatchModal = () => {
  const matchStatus = useSimulationStore(state => state.matchStatus);
  const matchStats = useSimulationStore(state => state.matchStats);
  const resetMatch = useSimulationStore(state => state.resetMatch);

  if (matchStatus !== 'finished') return null;

  const honScore = matchStats.score.teamA;
  const panScore = matchStats.score.teamB;
  let resultText = "EMPATE";
  if (honScore > panScore) resultText = "VICTORIA HONDURAS";
  if (panScore > honScore) resultText = "VICTORIA PANAMÁ";

  const totalPossession = Math.max(1, matchStats.possessionTicks.teamA + matchStats.possessionTicks.teamB);
  const possA = Math.round((matchStats.possessionTicks.teamA / totalPossession) * 100);
  const possB = Math.round((matchStats.possessionTicks.teamB / totalPossession) * 100);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-8 w-[500px] shadow-[0_0_50px_rgba(0,255,255,0.2)] text-center">
        <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-widest">TIEMPO COMPLETO</h2>
        <div className="text-2xl font-display font-bold text-cyan-400 mb-8 glow-cyan">{resultText}</div>
        
        <div className="flex justify-center items-center gap-8 mb-8">
          <div className="text-cyan font-display font-bold text-4xl">HON</div>
          <div className="text-white font-display font-bold text-6xl">{honScore} - {panScore}</div>
          <div className="text-magenta font-display font-bold text-4xl">PAN</div>
        </div>

        <div className="border-t border-white/10 pt-4 mb-8">
          <h3 className="text-white/50 text-sm tracking-widest mb-4">ESTADÍSTICAS FINALES</h3>
          <div className="flex justify-between items-center text-lg">
            <span className="text-cyan font-bold">{possA}%</span>
            <span className="text-white">Posesión</span>
            <span className="text-magenta font-bold">{possB}%</span>
          </div>
        </div>

        <button 
          onClick={resetMatch}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-8 rounded-full transition-colors w-full font-display tracking-wider"
        >
          REINICIAR PARTIDO
        </button>
      </div>
    </div>
  );
};
