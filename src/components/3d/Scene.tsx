import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Line } from '@react-three/drei';
import { useSimulationStore } from '../../store/useSimulationStore';
import { Pitch } from './Pitch';
import { PlayerComponent } from './Player';
import { BallComponent } from './Ball';
import { useRef } from 'react';
import * as THREE from 'three';

const CameraController = () => {
  const cameraMode = useSimulationStore(state => state.cameraMode);
  const ballPos = useSimulationStore(state => state.ball.position);
  const { camera } = useThree();
  const orbitRef = useRef<any>(null);

  useFrame(() => {
    if (cameraMode === 'ball') {
      // Follow the ball closely
      camera.position.lerp(new THREE.Vector3(ballPos[0], 10, ballPos[2] + 15), 0.05);
      camera.lookAt(ballPos[0], ballPos[1], ballPos[2]);
    } else if (cameraMode === 'ar') {
      // Like a broadcast overhead view or first person view
      camera.position.lerp(new THREE.Vector3(0, 15, 40), 0.05);
      camera.lookAt(0, 0, 0);
    }
    // If 'free', OrbitControls takes over
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 45, 60]} fov={45} onUpdate={(c) => c.lookAt(0, 0, 0)} />
      {cameraMode === 'free' && <OrbitControls ref={orbitRef} target={[0, 0, 0]} />}
    </>
  );
};

const PassTrajectories = () => {
  const trajectories = useSimulationStore(state => state.passTrajectories);
  
  return (
    <>
      {trajectories.map(t => (
        <Line 
          key={t.id}
          points={[t.start, t.end]}
          color="#00ffff"
          lineWidth={2}
          transparent
          opacity={t.opacity}
        />
      ))}
    </>
  );
};

export const Scene = () => {
  const players = useSimulationStore(state => state.players);

  return (
    <Canvas shadows className="w-full h-full bg-black">
      <CameraController />

      <ambientLight intensity={0.8} color="white" />
      <directionalLight
        position={[30, 50, 30]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 20, -10]} intensity={0.5} color="#00ffff" />
      <pointLight position={[10, 20, 10]} intensity={0.5} color="#ff00ff" />

      <Pitch />
      <PassTrajectories />

      {players.map(p => (
        <PlayerComponent key={p.id} id={p.id} />
      ))}

      <BallComponent />

      <Environment preset="night" />
    </Canvas>
  );
};
