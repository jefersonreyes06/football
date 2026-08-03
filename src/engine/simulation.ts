import { useSimulationStore } from '../store/useSimulationStore';
import type { Vector3, Ball, Player } from '../store/useSimulationStore';
import { updatePrediction } from './prediction';

const TICK_RATE = 33; // ~30 FPS
const PITCH_WIDTH = 100;
const PITCH_HEIGHT = 60;
const PLAYER_SPEED_BASE = 0.5;
const BALL_FRICTION = 0.98;

let simulationInterval: number | null = null;

// Helper to calculate distance
const distance = (p1: Vector3, p2: Vector3) => {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[2] - p2[2], 2));
};

const normalize = (v: Vector3): Vector3 => {
  const len = Math.sqrt(v[0] * v[0] + v[2] * v[2]);
  if (len === 0) return [0, 0, 0];
  return [v[0] / len, 0, v[2] / len];
};

export const startSimulationLoop = () => {
  if (simulationInterval) return;

  simulationInterval = window.setInterval(() => {
    const state = useSimulationStore.getState();
    if (!state.isPlaying) return;

    let { players, ball, matchStats } = state;
    
    // Check possession first
    let possessingPlayer: Player | null = null;
    let minBallDist = Infinity;

    players.forEach(p => {
      const d = distance(p.position, ball.position);
      if (d < 1.5 && d < minBallDist) {
        minBallDist = d;
        possessingPlayer = p;
      }
    });

    const teamPossession = possessingPlayer ? possessingPlayer.team : null;
    
    // Find closest 2 players for chasing (Double Pressure)
    let teamA_distances = players.filter(p => p.team === 'A').map(p => ({ p, d: distance(p.position, ball.position) })).sort((a, b) => a.d - b.d);
    let teamB_distances = players.filter(p => p.team === 'B').map(p => ({ p, d: distance(p.position, ball.position) })).sort((a, b) => a.d - b.d);

    const chasersA = [teamA_distances[0]?.p.id, teamA_distances[1]?.p.id];
    const chasersB = [teamB_distances[0]?.p.id, teamB_distances[1]?.p.id];

    let newBallPosition = [...ball.position] as Vector3;
    let newBallVelocity = [...ball.velocity] as Vector3;
    let newBallSpin = ball.spin;
    let newImpactForce = 0;

    let kickOccurred = false;
    let dribbleVelocity: Vector3 | null = null;
    let stealOccurred = false;

    // AI with Ball
    if (possessingPlayer) {
      if (possessingPlayer.team === 'A') matchStats.possessionTicks.teamA++;
      else matchStats.possessionTicks.teamB++;

      const isTeamA = possessingPlayer.team === 'A';
      const opponentGoal: Vector3 = isTeamA ? [PITCH_WIDTH / 2, 0, 0] : [-PITCH_WIDTH / 2, 0, 0];
      const distToGoal = distance(possessingPlayer.position, opponentGoal);

      possessingPlayer.possessionTimeMs += TICK_RATE * state.speedMultiplier;

      // Check for tackles from opposing chasers
      const opposingChasers = isTeamA ? teamB_distances.slice(0,2) : teamA_distances.slice(0,2);
      let underPressure = false;
      for (const chaser of opposingChasers) {
          if (chaser.d < 4.0) underPressure = true;
          if (chaser.d < 1.5) {
              // Tackle steal chance (60% per second => 0.6 * 33/1000 = 0.0198)
              if (Math.random() < 0.02 * state.speedMultiplier) {
                  stealOccurred = true;
                  // Kick ball slightly away to defender
                  const kickDir = normalize([chaser.p.position[0] - possessingPlayer.position[0], 0, chaser.p.position[2] - possessingPlayer.position[2]]);
                  newBallVelocity = [kickDir[0] * 1.5, 0, kickDir[2] * 1.5];
                  kickOccurred = true;
                  possessingPlayer.possessionTimeMs = 0;
                  break;
              }
          }
      }

      if (!stealOccurred) {
          // Decision making
          const needsToPass = possessingPlayer.possessionTimeMs > 3500 || underPressure;
          const canShoot = distToGoal < 25;

          const makesDecision = Math.random() > 0.80;

          if (makesDecision && canShoot && Math.random() > 0.5) {
              // SHOOT
              const targetZ = (Math.random() - 0.5) * 8; 
              const kickDir = normalize([opponentGoal[0] - possessingPlayer.position[0], 0, targetZ - possessingPlayer.position[2]]);
              const kickPower = 2.5 + Math.random() * 1.5;
              
              newBallVelocity = [kickDir[0] * kickPower, 0, kickDir[2] * kickPower];
              newImpactForce = 800 + Math.random() * 400; 
              newBallSpin = 300 + Math.random() * 500;
              kickOccurred = true;
              possessingPlayer.possessionTimeMs = 0;
          } else if (makesDecision && needsToPass) {
              // PASS
              const teammates = players.filter(p => p.team === possessingPlayer!.team && p.id !== possessingPlayer!.id);
              const advancedTeammates = teammates.filter(p => isTeamA ? p.position[0] > possessingPlayer!.position[0] + 2 : p.position[0] < possessingPlayer!.position[0] - 2);
              
              if (advancedTeammates.length > 0) {
                  // Pick the one closest to goal that is unmarked
                  const target = advancedTeammates[Math.floor(Math.random() * advancedTeammates.length)];
                  const kickDir = normalize([target.position[0] - possessingPlayer.position[0], 0, target.position[2] - possessingPlayer.position[2]]);
                  const kickPower = 2.0 + Math.random() * 1.0;

                  newBallVelocity = [kickDir[0] * kickPower, 0, kickDir[2] * kickPower];
                  newImpactForce = 400 + Math.random() * 300;
                  newBallSpin = 100 + Math.random() * 200;
                  kickOccurred = true;
                  possessingPlayer.possessionTimeMs = 0;
              } else if (possessingPlayer.possessionTimeMs > 4000) {
                  // Forced bad pass if held too long
                  const kickDir = normalize([(Math.random()-0.5), 0, (Math.random()-0.5)]);
                  newBallVelocity = [kickDir[0] * 2, 0, kickDir[2] * 2];
                  kickOccurred = true;
                  possessingPlayer.possessionTimeMs = 0;
              }
          }

          if (!kickOccurred) {
              // DRIBBLE
              const targetX = opponentGoal[0];
              const dir = normalize([targetX - possessingPlayer.position[0], 0, opponentGoal[2] - possessingPlayer.position[2]]);
              
              dribbleVelocity = [dir[0] * PLAYER_SPEED_BASE * 0.8, 0, dir[2] * PLAYER_SPEED_BASE * 0.8];
              
              newBallPosition = [
                  possessingPlayer.position[0] + dribbleVelocity[0] * 2,
                  0.5,
                  possessingPlayer.position[2] + dribbleVelocity[2] * 2
              ];
              newBallVelocity = [0, 0, 0];
              newBallSpin = 0;
              newImpactForce = 150 + Math.random() * 100;
          }
      }
    } else {
      // Clear possession times when ball is loose
      players.forEach(p => p.possessionTimeMs = 0);
      
      // Ball physics
      newBallPosition[0] += newBallVelocity[0] * state.speedMultiplier;
      newBallPosition[2] += newBallVelocity[2] * state.speedMultiplier;
      newBallVelocity[0] *= BALL_FRICTION;
      newBallVelocity[2] *= BALL_FRICTION;
      newBallSpin *= 0.95; 
      newImpactForce = 0;
    }

    // 1. Update Players
    const updatedPlayers = players.map(player => {
      // If player is the one possessing and driving the ball
      if (possessingPlayer && player.id === possessingPlayer.id && !kickOccurred && dribbleVelocity) {
        let newX = player.position[0] + dribbleVelocity[0] * state.speedMultiplier;
        let newZ = player.position[2] + dribbleVelocity[2] * state.speedMultiplier;
        
        const currentSpeed = Math.sqrt(dribbleVelocity[0]**2 + dribbleVelocity[2]**2);
        return {
          ...player,
          position: [newX, 0, newZ] as Vector3,
          velocity: dribbleVelocity,
          isPossessing: true,
          biometrics: {
            ...player.biometrics,
            heartRate: 70 + (currentSpeed * 100) + (Math.random() * 5),
            fatigue: Math.min(100, player.biometrics.fatigue + currentSpeed * 0.01 * state.speedMultiplier),
            strideImpact: currentSpeed > 0.1 ? 500 + Math.random() * 300 : 0
          }
        };
      }

      let vx = player.velocity[0];
      let vz = player.velocity[2];

      const isChaser = (chasersA.includes(player.id) || chasersB.includes(player.id));
      player.state = isChaser ? 'CHASING_BALL' : 'MAINTAINING_POSITION';

      const fatigueFactor = Math.max(0.2, 1 - (player.biometrics.fatigue / 100));
      const targetSpeed = PLAYER_SPEED_BASE * fatigueFactor;

      let targetX = player.homePosition[0];
      let targetZ = player.homePosition[2];

      const isAttacking = teamPossession === player.team;
      const ownGoal = player.team === 'A' ? [-PITCH_WIDTH/2, 0, 0] : [PITCH_WIDTH/2, 0, 0];

      if (player.state === 'CHASING_BALL' && player.role !== 'GK') {
        // Double pressure: if chaser 2, approach from a slight angle to cut off
        targetX = ball.position[0];
        targetZ = ball.position[2];
      } else {
        if (player.role === 'GK') {
           // GK AI: Bisect angle between ball and goal center
           // Place GK slightly ahead of goal line, proportional to ball distance
           const distToBall = distance(ownGoal, ball.position);
           const advance = Math.min(5, distToBall * 0.1); // Max 5 meters out
           const dirFromGoal = normalize([ball.position[0] - ownGoal[0], 0, ball.position[2] - ownGoal[2]]);
           
           targetX = ownGoal[0] + dirFromGoal[0] * advance;
           targetZ = ownGoal[2] + dirFromGoal[2] * advance;
           
           // Clamp GK to penalty area approx
           targetZ = Math.max(-10, Math.min(10, targetZ));
        } else {
           // Dynamic shifting based on ball position X
           const shiftPercent = ball.position[0] / (PITCH_WIDTH / 2); 
           
           if (isAttacking) {
             // Shift forward
             if (player.role === 'FWD') targetX += player.team === 'A' ? 35 : -35;
             else if (player.role === 'MID') targetX += player.team === 'A' ? 25 : -25;
             else if (player.role === 'DEF') targetX += player.team === 'A' ? 15 : -15;
           } else {
             // Shift backward
             if (player.role === 'FWD') targetX -= player.team === 'A' ? 10 : -10;
             else if (player.role === 'MID') targetX -= player.team === 'A' ? 15 : -15;
             else if (player.role === 'DEF') targetX -= player.team === 'A' ? 20 : -20;
             
             targetX += shiftPercent * 5; 
           }

           // Add slight coverage of passing lanes if defending
           if (!isAttacking && !isChaser) {
               targetZ = (targetZ + ball.position[2]) / 2;
           }
        }
      }

      // Calculate direction towards target
      const dirX = targetX - player.position[0];
      const dirZ = targetZ - player.position[2];
      const distToTarget = Math.sqrt(dirX * dirX + dirZ * dirZ);
      
      if (distToTarget > 1.0) {
        const dirNorm = normalize([dirX, 0, dirZ]);
        vx = dirNorm[0] * targetSpeed;
        vz = dirNorm[2] * targetSpeed;
      } else {
        vx = (Math.random() - 0.5) * 0.05;
        vz = (Math.random() - 0.5) * 0.05;
      }

      let newX = player.position[0] + vx * state.speedMultiplier;
      let newZ = player.position[2] + vz * state.speedMultiplier;

      // Pitch boundaries
      if (newX > PITCH_WIDTH / 2) newX = PITCH_WIDTH / 2;
      if (newX < -PITCH_WIDTH / 2) newX = -PITCH_WIDTH / 2;
      if (newZ > PITCH_HEIGHT / 2) newZ = PITCH_HEIGHT / 2;
      if (newZ < -PITCH_HEIGHT / 2) newZ = -PITCH_HEIGHT / 2;

      // GK Save logic: if ball is fast and close to GK, try to block
      if (player.role === 'GK') {
          const ballDistToGK = distance([newX, 0, newZ], newBallPosition);
          const ballSpeed = Math.sqrt(newBallVelocity[0]**2 + newBallVelocity[2]**2);
          if (ballDistToGK < 3.0 && ballSpeed > 0.5) {
              // 70% save chance
              if (Math.random() < 0.70) {
                  // Block it
                  newBallVelocity[0] *= -0.5;
                  newBallVelocity[2] *= -0.5;
                  newBallPosition[0] = newX + (newBallPosition[0] > newX ? 1 : -1);
              }
          }
      }

      const currentSpeed = Math.sqrt(vx * vx + vz * vz);
      const newHeartRate = 70 + (currentSpeed * 100) + (Math.random() * 5); 
      const newFatigue = Math.min(100, player.biometrics.fatigue + currentSpeed * 0.01 * state.speedMultiplier);
      const strideImpact = currentSpeed > 0.1 ? 500 + Math.random() * 300 : 0; 

      return {
        ...player,
        position: [newX, 0, newZ] as Vector3,
        velocity: [vx, 0, vz] as Vector3,
        biometrics: {
          heartRate: newHeartRate,
          fatigue: newFatigue,
          strideImpact,
        },
        isPossessing: false
      };
    });

    let goalScored = false;
    let teamConceded: 'A' | 'B' | null = null;

    // Bounce off walls or Goal
    if (newBallPosition[0] >= PITCH_WIDTH / 2) {
      if (Math.abs(newBallPosition[2]) < 6) {
        matchStats.score.teamA += 1;
        alert("¡GOOOL DE HONDURAS!");
        goalScored = true;
        teamConceded = 'B';
      } else {
        newBallPosition[0] = PITCH_WIDTH / 2 - 1;
        newBallVelocity[0] *= -0.8;
      }
    } else if (newBallPosition[0] <= -PITCH_WIDTH / 2) {
      if (Math.abs(newBallPosition[2]) < 6) {
        matchStats.score.teamB += 1;
        alert("¡GOOOL DE PANAMÁ!");
        goalScored = true;
        teamConceded = 'A';
      } else {
        newBallPosition[0] = -PITCH_WIDTH / 2 + 1;
        newBallVelocity[0] *= -0.8;
      }
    }

    if (newBallPosition[2] > PITCH_HEIGHT / 2) {
      newBallPosition[2] = PITCH_HEIGHT / 2;
      newBallVelocity[2] *= -0.8;
    } else if (newBallPosition[2] < -PITCH_HEIGHT / 2) {
      newBallPosition[2] = -PITCH_HEIGHT / 2;
      newBallVelocity[2] *= -0.8;
    }

    if (goalScored) {
        // Reset to initial positions
        newBallPosition = [0, 0.5, 0];
        
        // Give ball slight tap to team that conceded
        if (teamConceded === 'A') newBallVelocity = [-0.5, 0, 0];
        if (teamConceded === 'B') newBallVelocity = [0.5, 0, 0];
        
        updatedPlayers.forEach(p => {
            p.position = [...p.homePosition] as Vector3;
            p.velocity = [0, 0, 0];
            p.possessionTimeMs = 0;
        });
    }

    const updatedBall: Ball = {
      position: newBallPosition,
      velocity: newBallVelocity,
      rotation: [ball.rotation[0] + newBallVelocity[2] * 0.1, ball.rotation[1], ball.rotation[2] + newBallVelocity[0] * 0.1], 
      spin: newBallSpin,
      impactForce: newImpactForce
    };

    const newPrediction = updatePrediction(updatedPlayers, matchStats);

    useSimulationStore.getState().updateState({
      players: updatedPlayers,
      ball: updatedBall,
      matchStats: {
        ...matchStats,
        winProbability: newPrediction
      }
    });

  }, TICK_RATE);
};

export const stopSimulationLoop = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};
