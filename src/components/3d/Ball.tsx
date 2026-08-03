import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

export const BallComponent = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<THREE.Line>(null);
  const trailPositions = useRef<THREE.Vector3[]>([]);

  useFrame(() => {
    const ball = useSimulationStore.getState().ball;
    if (!meshRef.current) return;

    // Smooth movement
    const targetPos = new THREE.Vector3(ball.position[0], ball.position[1], ball.position[2]);
    meshRef.current.position.lerp(targetPos, 0.5);

    // Apply rotation
    meshRef.current.rotation.x = ball.rotation[0];
    meshRef.current.rotation.y = ball.rotation[1];
    meshRef.current.rotation.z = ball.rotation[2];

    // Trail update
    if (trailRef.current) {
      const pos = meshRef.current.position.clone();
      trailPositions.current.push(pos);
      if (trailPositions.current.length > 20) {
        trailPositions.current.shift();
      }
      const geometry = trailRef.current.geometry as THREE.BufferGeometry;
      geometry.setFromPoints(trailPositions.current);
    }

    // AR HUD update
    if (hudRef.current && (ball.spin > 50 || ball.impactForce > 100)) {
      hudRef.current.style.opacity = '1';
      hudRef.current.innerHTML = `
        <div class="text-orange font-bold text-[10px]">IMPACT: ${Math.round(ball.impactForce)}N</div>
        <div class="text-cyan font-bold text-[10px]">SPIN: ${Math.round(ball.spin)} RPM</div>
      `;
    } else if (hudRef.current) {
      hudRef.current.style.opacity = '0';
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#444444" wireframe />
        
        {/* AR Overlay for Ball */}
        <Html position={[0, 1, 0]} center>
          <div 
            ref={hudRef}
            className="glass-panel p-1 border border-orange-500 opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap"
          ></div>
        </Html>
      </mesh>

      {/* Simple Trail */}
      <line ref={trailRef as any}>
        <bufferGeometry />
        <lineBasicMaterial color="#00ffff" transparent opacity={0.5} />
      </line>
    </group>
  );
};
