import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

interface PlayerProps {
  id: string;
}

export const PlayerComponent = ({ id }: PlayerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const isSelected = useSimulationStore(state => state.selectedPlayerId === id);
  const setSelected = useSimulationStore(state => state.setSelectedPlayer);

  // Instead of subscribing to the whole store (which would cause re-renders 30 times a second),
  // we use useFrame to directly read the Zustand store and mutate the THREE objects.
  
  const teamColor = useMemo(() => {
    // Need to get initial team
    const p = useSimulationStore.getState().players.find(p => p.id === id);
    return p?.team === 'A' ? '#00ffff' : '#ff00ff';
  }, [id]);

  const materials = useMemo(() => {
    return {
      body: new THREE.MeshStandardMaterial({ 
        color: teamColor, 
        roughness: 0.2, 
        metalness: 0.8,
        emissive: teamColor,
        emissiveIntensity: isSelected ? 0.8 : 0.2
      }),
      fatigueRing: new THREE.MeshBasicMaterial({ color: '#ff6600', side: THREE.DoubleSide, transparent: true, opacity: 0.6 }),
    }
  }, [teamColor, isSelected]);

  // Refs for direct DOM/WebGL mutation
  const velocityLineRef = useRef<any>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const p = useSimulationStore.getState().players.find(p => p.id === id);
    if (!p || !groupRef.current) return;

    // Smoothly interpolate position for 60fps rendering from 30fps physics
    const targetPos = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);
    groupRef.current.position.lerp(targetPos, 0.3);

    // Update Velocity Vector
    if (velocityLineRef.current) {
      // update geometry points directly or let React handle it if it's too complex. 
      // Actually Drei Line creates a new geometry if points change. For pure perf, custom line geometry is better,
      // but let's see if this is ok. We can just update rotation of a fixed line.
      
      const angle = Math.atan2(p.velocity[0], p.velocity[2]);
      groupRef.current.rotation.y = angle; 
    }

    // Update Fatigue Ring Scale
    if (ringRef.current) {
      const scale = 1 + (p.biometrics.fatigue / 100);
      ringRef.current.scale.set(scale, scale, scale);
      // color based on fatigue
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (p.biometrics.fatigue > 80) mat.color.setHex(0xff0000);
      else if (p.biometrics.fatigue > 40) mat.color.setHex(0xffaa00);
      else mat.color.setHex(0x00ff00);
    }

    // Update DOM element text directly to avoid React re-renders
    if (hudRef.current && isSelected) {
      const hr = Math.round(p.biometrics.heartRate);
      const fat = Math.round(p.biometrics.fatigue);
      hudRef.current.innerHTML = `
        <div class="font-display font-bold text-xs" style="color: ${teamColor}">${p.name} #${p.number}</div>
        <div class="text-[10px]">HR: <span class="text-white">${hr} bpm</span></div>
        <div class="text-[10px]">FAT: <span class="text-white">${fat}%</span></div>
      `;
    }
  });

  return (
    <group ref={groupRef} onClick={(e) => { e.stopPropagation(); setSelected(id); }}>
      {/* Player Body (Capsule) */}
      <mesh position={[0, 0.6, 0]} material={materials.body} castShadow receiveShadow>
        <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
      </mesh>

      {/* Effort/Fatigue Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.05, 0]} material={materials.fatigueRing}>
        <ringGeometry args={[0.6, 0.8, 32]} />
      </mesh>

      {/* AR HUD Overlay */}
      {isSelected && (
        <Html position={[0, 3.5, 0]} center zIndexRange={[100, 0]}>
          <div 
            ref={hudRef}
            className="glass-panel p-2 min-w-[100px] text-center border pointer-events-none"
            style={{ borderColor: teamColor }}
          >
            {/* Populated by useFrame */}
          </div>
        </Html>
      )}
    </group>
  );
};
