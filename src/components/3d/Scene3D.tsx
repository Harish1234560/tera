import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import ParticleField from "./ParticleField";
import DataOrb from "./DataOrb";

const Scene3D = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} color="#d4a853" />
          <ParticleField count={500} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
