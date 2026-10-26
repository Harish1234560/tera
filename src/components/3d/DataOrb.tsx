import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const DataOrb = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = state.clock.elapsedTime * 0.5;
      ringRef1.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y = state.clock.elapsedTime * 0.4;
      ringRef2.current.rotation.x = Math.PI / 3 + state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group>
      {/* Core orb */}
      <Sphere ref={meshRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#c8943a"
          emissive="#8b4513"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Inner glow */}
      <Sphere args={[1.25, 32, 32]}>
        <meshBasicMaterial
          color="#d4a853"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Orbital ring 1 */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[2, 0.015, 16, 100]} />
        <meshBasicMaterial color="#d4a853" transparent opacity={0.6} />
      </mesh>

      {/* Orbital ring 2 */}
      <mesh ref={ringRef2}>
        <torusGeometry args={[2.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#c75b39" transparent opacity={0.4} />
      </mesh>

      {/* Orbiting nodes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <OrbitalNode key={i} index={i} />
      ))}

      {/* Ambient light for the orb */}
      <pointLight position={[0, 0, 0]} color="#d4a853" intensity={2} distance={8} />
    </group>
  );
};

const OrbitalNode = ({ index }: { index: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const angle = (index / 5) * Math.PI * 2;
  const radius = 2.8;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.3 + angle;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t * 0.7) * 0.5;
    ref.current.position.z = Math.sin(t) * radius;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={index % 2 === 0 ? "#d4a853" : "#c75b39"} />
    </mesh>
  );
};

export default DataOrb;
