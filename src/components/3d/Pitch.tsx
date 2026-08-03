import { Line } from '@react-three/drei';

export const Pitch = () => {
  // Pitch dimensions 100x60
  return (
    <group>
      {/* Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[110, 70]} />
        <meshStandardMaterial color="#1b4d3e" roughness={0.8} />
      </mesh>
      
      {/* Lines */}
      {/* Outer bounds */}
      <Line points={[[-50, 0.01, -30], [50, 0.01, -30], [50, 0.01, 30], [-50, 0.01, 30], [-50, 0.01, -30]]} color="#00ffff" lineWidth={2} />
      
      {/* Center line */}
      <Line points={[[0, 0.01, -30], [0, 0.01, 30]]} color="#00ffff" lineWidth={2} />
      
      {/* Center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[9, 9.2, 32]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      
      {/* Penalty areas */}
      <Line points={[[-50, 0.01, -15], [-35, 0.01, -15], [-35, 0.01, 15], [-50, 0.01, 15]]} color="#00ffff" lineWidth={2} />
      <Line points={[[50, 0.01, -15], [35, 0.01, -15], [35, 0.01, 15], [50, 0.01, 15]]} color="#00ffff" lineWidth={2} />

      {/* Cyberpunk Grid Overlay */}
      <gridHelper args={[110, 55, '#004444', '#001111']} position={[0, 0, 0]} />
    </group>
  );
};
