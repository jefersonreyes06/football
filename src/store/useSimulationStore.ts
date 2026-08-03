import { create } from 'zustand';

export type Vector3 = [number, number, number];

export interface Biometrics {
  heartRate: number;
  fatigue: number; // 0 to 100
  strideImpact: number; // Newtons
}

export interface Player {
  id: string;
  name: string;
  team: 'A' | 'B';
  position: Vector3;
  velocity: Vector3;
  biometrics: Biometrics;
  isPossessing: boolean;
  number: number;
  role: 'GK' | 'DEF' | 'MID' | 'FWD';
  homePosition: Vector3;
  state: 'MAINTAINING_POSITION' | 'CHASING_BALL';
  possessionTimeMs: number;
}

export interface Ball {
  position: Vector3;
  velocity: Vector3;
  rotation: Vector3;
  spin: number; // RPM
  impactForce: number; // Newtons
}

export interface MatchStats {
  winProbability: { teamA: number; teamB: number };
  possessionTicks: { teamA: number; teamB: number };
  score: { teamA: number; teamB: number };
}

interface SimulationState {
  isPlaying: boolean;
  speedMultiplier: number;
  players: Player[];
  ball: Ball;
  matchStats: MatchStats;
  selectedPlayerId: string | null;
  cameraMode: 'free' | 'ball' | 'ar';
  
  // Actions
  togglePlay: () => void;
  setSpeedMultiplier: (speed: number) => void;
  setSelectedPlayer: (id: string | null) => void;
  setCameraMode: (mode: 'free' | 'ball' | 'ar') => void;
  updateState: (partialState: Partial<SimulationState>) => void;
}

// Initial dummy players for a 6v6
const generateInitialPlayers = (): Player[] => {
  const players: Player[] = [];
  const teamA_names = ['Martinez (GK)', 'Gomez (DEF)', 'Lopez (DEF)', 'Diaz (MID)', 'Ruiz (MID)', 'Perez (FWD)'];
  const teamB_names = ['Smith (GK)', 'Johnson (DEF)', 'Williams (DEF)', 'Brown (MID)', 'Jones (MID)', 'Davis (FWD)'];
  
  const roles: ('GK' | 'DEF' | 'DEF' | 'MID' | 'MID' | 'FWD')[] = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'FWD'];

  // Pitch size approx 100x60, so x: -50 to 50, z: -30 to 30
  // Team A starts on negative X, Team B on positive X
  
  const getHomePosition = (team: 'A' | 'B', role: string, index: number): Vector3 => {
    const sign = team === 'A' ? -1 : 1;
    switch (role) {
      case 'GK': return [sign * 45, 0, 0];
      case 'DEF': return [sign * 30, 0, (index === 1 ? -15 : 15)];
      case 'MID': return [sign * 10, 0, (index === 3 ? -15 : 15)];
      case 'FWD': return [sign * 2, 0, 0];
      default: return [0, 0, 0];
    }
  };

  for (let i = 0; i < 6; i++) {
    const role = roles[i];
    const homePos = getHomePosition('A', role, i);
    players.push({
      id: `A-${i+1}`,
      name: teamA_names[i],
      team: 'A',
      number: i + 1,
      position: [...homePos],
      velocity: [0, 0, 0],
      biometrics: { heartRate: 70, fatigue: 0, strideImpact: 0 },
      isPossessing: false,
      role: role as 'GK' | 'DEF' | 'MID' | 'FWD',
      homePosition: homePos,
      state: 'MAINTAINING_POSITION',
      possessionTimeMs: 0
    });
  }

  for (let i = 0; i < 6; i++) {
    const role = roles[i];
    const homePos = getHomePosition('B', role, i);
    players.push({
      id: `B-${i+1}`,
      name: teamB_names[i],
      team: 'B',
      number: i + 1,
      position: [...homePos],
      velocity: [0, 0, 0],
      biometrics: { heartRate: 70, fatigue: 0, strideImpact: 0 },
      isPossessing: false,
      role: role as 'GK' | 'DEF' | 'MID' | 'FWD',
      homePosition: homePos,
      state: 'MAINTAINING_POSITION',
      possessionTimeMs: 0
    });
  }
  return players;
};

export const useSimulationStore = create<SimulationState>((set) => ({
  isPlaying: false,
  speedMultiplier: 1,
  players: generateInitialPlayers(),
  ball: {
    position: [0, 0.5, 0], // Center of pitch, slightly elevated (radius)
    velocity: [0, 0, 0],
    rotation: [0, 0, 0],
    spin: 0,
    impactForce: 0,
  },
  matchStats: {
    winProbability: { teamA: 50, teamB: 50 },
    possessionTicks: { teamA: 0, teamB: 0 },
    score: { teamA: 0, teamB: 0 },
  },
  selectedPlayerId: null,
  cameraMode: 'free',

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSpeedMultiplier: (speed) => set({ speedMultiplier: speed }),
  setSelectedPlayer: (id) => set({ selectedPlayerId: id }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  updateState: (partialState) => set((state) => ({ ...state, ...partialState })),
}));
