import type { Player, MatchStats } from '../store/useSimulationStore';

/**
 * Predicts the win probability dynamically based on telemetry:
 * - Possession percentage
 * - Average team fatigue (higher fatigue lowers probability)
 * - Average territorial dominance (being closer to opponent's goal)
 */
export const updatePrediction = (
  players: Player[],
  stats: MatchStats
): { teamA: number; teamB: number } => {
  const totalTicks = stats.possessionTicks.teamA + stats.possessionTicks.teamB;
  
  // Base possession score
  let possessionScoreA = 50;
  let possessionScoreB = 50;
  if (totalTicks > 0) {
    possessionScoreA = (stats.possessionTicks.teamA / totalTicks) * 100;
    possessionScoreB = (stats.possessionTicks.teamB / totalTicks) * 100;
  }

  // Fatigue factor
  const teamA = players.filter(p => p.team === 'A');
  const teamB = players.filter(p => p.team === 'B');

  const avgFatigueA = teamA.reduce((acc, p) => acc + p.biometrics.fatigue, 0) / (teamA.length || 1);
  const avgFatigueB = teamB.reduce((acc, p) => acc + p.biometrics.fatigue, 0) / (teamB.length || 1);

  // Fatigue penalty (up to 20% reduction)
  const fatiguePenaltyA = (avgFatigueA / 100) * 20;
  const fatiguePenaltyB = (avgFatigueB / 100) * 20;

  // Territorial dominance
  // Team A wants positive X, Team B wants negative X
  const avgPosA = teamA.reduce((acc, p) => acc + p.position[0], 0) / (teamA.length || 1);
  const avgPosB = teamB.reduce((acc, p) => acc + p.position[0], 0) / (teamB.length || 1);

  // If A is deep in positive X (max 50), good.
  const territoryA = Math.max(0, avgPosA) / 50 * 10; 
  // If B is deep in negative X (min -50), good.
  const territoryB = Math.max(0, -avgPosB) / 50 * 10;

  // Calculate final weights
  let rawScoreA = possessionScoreA - fatiguePenaltyA + territoryA;
  let rawScoreB = possessionScoreB - fatiguePenaltyB + territoryB;

  // Normalize to 100%
  const totalRaw = rawScoreA + rawScoreB;
  if (totalRaw === 0) return { teamA: 50, teamB: 50 };

  let probA = (rawScoreA / totalRaw) * 100;
  let probB = (rawScoreB / totalRaw) * 100;

  // Clamp probabilities between 5% and 95%
  probA = Math.max(5, Math.min(95, probA));
  probB = 100 - probA;

  return {
    teamA: Math.round(probA * 10) / 10,
    teamB: Math.round(probB * 10) / 10
  };
};
