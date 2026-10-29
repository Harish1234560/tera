import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SPAN = 30;
const HALF = SPAN / 2;

/* soft round glow, built once and shared */
let glowTexture: THREE.CanvasTexture | null = null;
const getGlowTexture = () => {
  if (glowTexture) return glowTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glowTexture = new THREE.CanvasTexture(canvas);
  return glowTexture;
};

const ParticleField = ({ count = 600 }: { count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);

    const red = new THREE.Color("#ff3d2e");
    const amber = new THREE.Color("#ffb400");

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * SPAN;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPAN;
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPAN;

      const c = red.clone().lerp(amber, Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      speeds[i] = 0.25 + Math.random() * 0.6;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, speeds, phases };
  }, [count]);

  const texture = useMemo(() => getGlowTexture(), []);

  useFrame((state, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const attr = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    for (let i = 0; i < count; i++) {
      const iy = i * 3 + 1;
      arr[iy] += speeds[i] * dt;
      if (arr[iy] > HALF) arr[iy] -= SPAN;
      arr[i * 3] += Math.sin(t * 0.6 + phases[i]) * 0.15 * dt;
    }
    attr.needsUpdate = true;
    pts.rotation.y = t * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.28}
        map={texture}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleField;