import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ============================================================
   POWER CORE: an EEE-themed 3D scene
   - Tesla-style coil: energised copper winding + top toroid
   - Magnetic field loops with charge carriers running on them
   - Three-phase waveforms (R / Y / B, 120 degrees apart)
   - PCB traces on the floor with current pulses
   - Spark discharges + a floor shockwave on every strike
   Self-contained: only react, @react-three/fiber and three.
   ============================================================ */

const RED = "#ff3d2e";
const AMBER = "#ffb400";
const HOT = "#fff1d6";

const COIL_H = 3.2;
const COIL_R = 0.6;
const FLOOR_Y = -2.0;
const TOP_Y = COIL_H / 2 + 0.32;

/* sharp flash + weaker echo, repeating */
const PERIOD = 3.4;
const strikeAt = (t: number, offset = 0) => {
  const p = ((t + offset) % PERIOD) / PERIOD;
  const main = Math.exp(-Math.pow((p - 0.12) / 0.02, 2));
  const echo = 0.6 * Math.exp(-Math.pow((p - 0.19) / 0.02, 2));
  return Math.min(1, main + echo);
};

const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* soft round glow, built once */
let glowTex: THREE.CanvasTexture | null = null;
const getGlow = () => {
  if (glowTex) return glowTex;
  const size = 128;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
};

const makePoints = (count: number, size: number, withColors: boolean) => {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  if (withColors) {
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  }
  const mat = new THREE.PointsMaterial({
    size,
    map: getGlow(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: withColors,
    sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
};

const disposeAll = (objs: (THREE.Line | THREE.Points | THREE.LineSegments)[]) => {
  objs.forEach((o) => {
    o.geometry.dispose();
    (o.material as THREE.Material).dispose();
  });
};

/* ---------- shaders for the coil ---------- */
const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const WIRE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uStrike;
  uniform vec3 uRed;
  uniform vec3 uAmber;
  uniform vec3 uHot;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float phase = vUv.x * 7.0 - uTime * 0.7;
    float band = pow(0.5 + 0.5 * sin(6.2831853 * phase), 5.0);
    float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.0);
    vec3 base = mix(uRed * 0.55, uAmber * 0.8, vUv.x);
    vec3 col = base * 0.55 + uAmber * band * 1.2 + uHot * pow(band, 3.0) * 0.9 + uRed * fres * 0.6;
    col *= 0.9 + uStrike * 1.1;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const RIM_FRAG = /* glsl */ `
  uniform float uStrike;
  uniform vec3 uRed;
  uniform vec3 uAmber;
  uniform vec3 uHot;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 1.6);
    vec3 col = mix(uRed * 0.35, uAmber, f) + uHot * pow(f, 4.0) * 0.8;
    col *= 0.9 + uStrike * 1.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* helical winding */
class HelixCurve extends THREE.Curve<THREE.Vector3> {
  radius: number;
  height: number;
  turns: number;
  constructor(radius: number, height: number, turns: number) {
    super();
    this.radius = radius;
    this.height = height;
    this.turns = turns;
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = t * this.turns * Math.PI * 2;
    return target.set(
      Math.cos(a) * this.radius,
      -this.height / 2 + t * this.height,
      Math.sin(a) * this.radius
    );
  }
}

type Mats = {
  uniforms: {
    uTime: { value: number };
    uStrike: { value: number };
    uRed: { value: THREE.Vector3 };
    uAmber: { value: THREE.Vector3 };
    uHot: { value: THREE.Vector3 };
  };
  wire: THREE.ShaderMaterial;
  rim: THREE.ShaderMaterial;
};

/* ---------- coil ---------- */
const Coil = ({ mats, mobile }: { mats: Mats; mobile: boolean }) => {
  const geo = useMemo(
    () =>
      new THREE.TubeGeometry(
        new HelixCurve(COIL_R, COIL_H, 14),
        mobile ? 260 : 420,
        0.035,
        6,
        false
      ),
    [mobile]
  );
  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <group>
      {/* energised winding */}
      <mesh geometry={geo} material={mats.wire} />

      {/* glowing core */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, COIL_H + 0.1, 24, 1, true]} />
        <meshBasicMaterial
          color={RED}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* top toroid */}
      <mesh position={[0, TOP_Y, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.rim}>
        <torusGeometry args={[0.5, 0.13, 20, 56]} />
      </mesh>

      {/* base ring */}
      <mesh position={[0, -COIL_H / 2 - 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.03, 8, 80]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

/* ---------- magnetic field loops + charge carriers ---------- */
const HH = 1.9;
const loopPoint = (a: number, L: number, phi: number, out: THREE.Vector3) => {
  const rho = L * Math.sin(a);
  return out.set(rho * Math.cos(phi), HH * Math.cos(a), rho * Math.sin(phi));
};

const FieldLines = ({ mobile }: { mobile: boolean }) => {
  const group = useRef<THREE.Group>(null);

  const { loops, lines, beads } = useMemo(() => {
    const n = mobile ? 8 : 14;
    const N = 40;
    const loops = Array.from({ length: n }, (_, i) => ({
      L: 1.0 + (i % 4) * 0.5,
      phi: (i / n) * Math.PI * 2 + (i % 2) * 0.2,
      speed: 0.09 + (i % 3) * 0.03,
    }));

    const pos = new Float32Array(n * N * 2 * 3);
    const col = new Float32Array(n * N * 2 * 3);
    const v = new THREE.Vector3();
    const cRed = new THREE.Color(RED);
    const cAmb = new THREE.Color(AMBER);
    let o = 0;
    loops.forEach((l, i) => {
      const c = i % 2 === 0 ? cRed : cAmb;
      for (let j = 0; j < N; j++) {
        for (const k of [j, j + 1]) {
          loopPoint((k / N) * Math.PI, l.L, l.phi, v);
          pos[o] = v.x;
          pos[o + 1] = v.y;
          pos[o + 2] = v.z;
          col[o] = c.r;
          col[o + 1] = c.g;
          col[o + 2] = c.b;
          o += 3;
        }
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const lines = new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    lines.frustumCulled = false;

    const beads = makePoints(n * 2, 0.2, false);
    (beads.material as THREE.PointsMaterial).color = new THREE.Color(AMBER);
    return { loops, lines, beads };
  }, [mobile]);

  useEffect(() => () => disposeAll([lines, beads]), [lines, beads]);

  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = strikeAt(t);
    if (group.current) group.current.rotation.y = t * 0.1;
    (lines.material as THREE.LineBasicMaterial).opacity = 0.28 + 0.5 * s;

    const attr = beads.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    loops.forEach((l, i) => {
      for (let j = 0; j < 2; j++) {
        const u = (t * l.speed + i * 0.37 + j * 0.5) % 1;
        loopPoint(u * Math.PI, l.L, l.phi, v);
        const idx = (i * 2 + j) * 3;
        arr[idx] = v.x;
        arr[idx + 1] = v.y;
        arr[idx + 2] = v.z;
      }
    });
    attr.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <primitive object={lines} />
      <primitive object={beads} />
    </group>
  );
};

/* ---------- three-phase waveforms ---------- */
const PhaseWaves = ({ half }: { half: number }) => {
  const N = 200;

  const lines = useMemo(() => {
    const colors = [RED, AMBER, "#ffffff"].map((c) => new THREE.Color(c));
    return colors.map((base) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      const col = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * 2 - 1;
        const env = Math.max(0, 1 - Math.pow(Math.abs(x), 3));
        col[i * 3] = base.r * env;
        col[i * 3 + 1] = base.g * env;
        col[i * 3 + 2] = base.b * env;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      line.frustumCulled = false;
      return line;
    });
  }, []);

  useEffect(() => () => disposeAll(lines), [lines]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = strikeAt(t);
    const amp = 0.5 * (1 + 0.5 * s);
    lines.forEach((line, k) => {
      const attr = line.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < N; i++) {
        const x = -half + (i / (N - 1)) * 2 * half;
        arr[i * 3] = x;
        arr[i * 3 + 1] = amp * Math.sin(1.1 * x - 2.4 * t + k * 2.0944);
        arr[i * 3 + 2] = (k - 1) * 0.18;
      }
      attr.needsUpdate = true;
    });
  });

  return (
    <group position={[0, FLOOR_Y + 0.55, 1.5]}>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
};

/* ---------- PCB traces with current pulses ---------- */
const DIRS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return [Math.cos(a), Math.sin(a)] as const;
});

type Poly = { pts: [number, number][]; cum: number[] };

const buildTraces = (count: number, maxR: number): Poly[] => {
  const rnd = seeded(2026);
  const out: Poly[] = [];
  for (let k = 0; k < count; k++) {
    const a = (k / count) * Math.PI * 2 + (rnd() - 0.5) * 0.3;
    let x = Math.cos(a) * 0.95;
    let z = Math.sin(a) * 0.95;
    let di = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
    const pts: [number, number][] = [[x, z]];
    const segs = 3 + Math.floor(rnd() * 3);
    for (let s = 0; s < segs; s++) {
      const len = 0.5 + rnd() * 0.9;
      const nx = x + DIRS[di][0] * len;
      const nz = z + DIRS[di][1] * len;
      if (Math.hypot(nx, nz) > maxR) break;
      x = nx;
      z = nz;
      pts.push([x, z]);
      const turn = rnd() < 0.5 ? -1 : 1;
      di = (di + turn + 8) % 8;
      if (DIRS[di][0] * x + DIRS[di][1] * z < 0) di = (di - 2 * turn + 16) % 8;
    }
    if (pts.length < 2) continue;
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      cum.push(
        cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
      );
    }
    out.push({ pts, cum });
  }
  return out;
};

const posOnPoly = (p: Poly, u: number, out: [number, number]) => {
  const total = p.cum[p.cum.length - 1];
  const d = Math.min(Math.max(u, 0), 1) * total;
  let i = 0;
  while (i < p.cum.length - 2 && p.cum[i + 1] < d) i++;
  const f = (d - p.cum[i]) / Math.max(p.cum[i + 1] - p.cum[i], 1e-6);
  out[0] = p.pts[i][0] + f * (p.pts[i + 1][0] - p.pts[i][0]);
  out[1] = p.pts[i][1] + f * (p.pts[i + 1][1] - p.pts[i][1]);
};

const PcbBoard = ({ mobile }: { mobile: boolean }) => {
  const { polys, lines, pads, beads, speeds, offsets } = useMemo(() => {
    const polys = buildTraces(mobile ? 14 : 22, mobile ? 3.2 : 5.4);

    const segCount = polys.reduce((n, p) => n + p.pts.length - 1, 0);
    const lp = new Float32Array(segCount * 2 * 3);
    const lc = new Float32Array(segCount * 2 * 3);
    const cA = new THREE.Color(AMBER);
    const cR = new THREE.Color(RED);
    let o = 0;
    polys.forEach((p, k) => {
      const c = k % 2 === 0 ? cA : cR;
      for (let i = 0; i < p.pts.length - 1; i++) {
        for (const q of [i, i + 1]) {
          lp[o] = p.pts[q][0];
          lp[o + 1] = FLOOR_Y;
          lp[o + 2] = p.pts[q][1];
          lc[o] = c.r * 0.8;
          lc[o + 1] = c.g * 0.8;
          lc[o + 2] = c.b * 0.8;
          o += 3;
        }
      }
    });
    const lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute("position", new THREE.BufferAttribute(lp, 3));
    lgeo.setAttribute("color", new THREE.BufferAttribute(lc, 3));
    const lines = new THREE.LineSegments(
      lgeo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    lines.frustumCulled = false;

    const pads = makePoints(polys.length, 0.2, false);
    (pads.material as THREE.PointsMaterial).color = new THREE.Color(AMBER);
    (pads.material as THREE.PointsMaterial).opacity = 0.85;
    const pa = pads.geometry.attributes.position as THREE.BufferAttribute;
    polys.forEach((p, i) => {
      const e = p.pts[p.pts.length - 1];
      pa.setXYZ(i, e[0], FLOOR_Y, e[1]);
    });
    pa.needsUpdate = true;

    const beads = makePoints(polys.length * 3, 0.26, true);
    const bc = beads.geometry.attributes.color as THREE.BufferAttribute;
    const hot = new THREE.Color(HOT);
    const mid = new THREE.Color(AMBER).multiplyScalar(0.6);
    const tail = new THREE.Color(RED).multiplyScalar(0.35);
    polys.forEach((_, i) => {
      bc.setXYZ(i * 3, hot.r, hot.g, hot.b);
      bc.setXYZ(i * 3 + 1, mid.r, mid.g, mid.b);
      bc.setXYZ(i * 3 + 2, tail.r, tail.g, tail.b);
    });
    bc.needsUpdate = true;

    const rnd = seeded(77);
    const speeds = polys.map(() => 0.6 + rnd() * 0.9);
    const offsets = polys.map(() => rnd());
    return { polys, lines, pads, beads, speeds, offsets };
  }, [mobile]);

  useEffect(() => () => disposeAll([lines, pads, beads]), [lines, pads, beads]);

  const phase = useRef(0);
  const tmp = useMemo<[number, number]>(() => [0, 0], []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const s = strikeAt(t);
    phase.current += Math.min(delta, 0.05) * (0.16 + s * 0.5);
    (lines.material as THREE.LineBasicMaterial).opacity = 0.4 + 0.4 * s;

    const attr = beads.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    polys.forEach((p, i) => {
      for (let b = 0; b < 3; b++) {
        const u = (((offsets[i] + phase.current * speeds[i] - b * 0.035) % 1) + 1) % 1;
        posOnPoly(p, u, tmp);
        const idx = (i * 3 + b) * 3;
        arr[idx] = tmp[0];
        arr[idx + 1] = FLOOR_Y + 0.01;
        arr[idx + 2] = tmp[1];
      }
    });
    attr.needsUpdate = true;
  });

  return (
    <group>
      <primitive object={lines} />
      <primitive object={pads} />
      <primitive object={beads} />
    </group>
  );
};

/* ---------- floor glow + shockwave ---------- */
const FloorFx = () => {
  const glow = useMemo(() => getGlow(), []);
  const shock = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!shock.current) return;
    const p = (state.clock.elapsedTime % PERIOD) / PERIOD;
    const u = Math.min(1, Math.max(0, (p - 0.12) / 0.5));
    const on = p > 0.12 && p < 0.62;
    shock.current.scale.setScalar(1 + u * 5);
    (shock.current.material as THREE.MeshBasicMaterial).opacity = on ? (1 - u) * 0.6 : 0;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.005, 0]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial
          map={glow}
          color={RED}
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={shock} rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.02, 0]}>
        <ringGeometry args={[0.97, 1, 96]} />
        <meshBasicMaterial
          color={AMBER}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

/* ---------- spark discharge from the top toroid ---------- */
const SEGMENTS = 22;

const Spark = ({
  from,
  to,
  offset,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  offset: number;
}) => {
  const lastRef = useRef(0);
  const flashRef = useRef<THREE.Sprite>(null);
  const glow = useMemo(() => getGlow(), []);

  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array((SEGMENTS + 1) * 3), 3)
    );
    const material = new THREE.LineBasicMaterial({
      color: HOT,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const l = new THREE.Line(geometry, material);
    l.frustumCulled = false;
    return l;
  }, []);

  useEffect(() => () => disposeAll([line]), [line]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = strikeAt(t, offset);
    (line.material as THREE.LineBasicMaterial).opacity = 0.04 + 0.9 * s;
    if (flashRef.current) {
      (flashRef.current.material as THREE.SpriteMaterial).opacity = 0.2 + 0.75 * s;
      flashRef.current.scale.setScalar(0.4 + s * 0.8);
    }

    if (t - lastRef.current < 0.06) return;
    lastRef.current = t;
    const attr = line.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i <= SEGMENTS; i++) {
      const u = i / SEGMENTS;
      const k = Math.sin(Math.PI * u) * 0.45;
      arr[i * 3] = from.x + (to.x - from.x) * u + (Math.random() - 0.5) * k;
      arr[i * 3 + 1] = from.y + (to.y - from.y) * u + (Math.random() - 0.5) * k;
      arr[i * 3 + 2] = from.z + (to.z - from.z) * u + (Math.random() - 0.5) * k;
    }
    attr.needsUpdate = true;
  });

  return (
    <group>
      <primitive object={line} />
      <sprite ref={flashRef} position={to}>
        <spriteMaterial
          map={glow}
          color={AMBER}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
};

const Discharges = ({ mobile }: { mobile: boolean }) => {
  const sparks = useMemo(() => {
    const n = mobile ? 3 : 5;
    const rnd = seeded(5);
    const from = new THREE.Vector3(0, TOP_Y + 0.14, 0);
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + 0.5;
      const R = 2.5 + rnd() * 0.5;
      return {
        from,
        to: new THREE.Vector3(Math.cos(a) * R, 0.4 + rnd() * 1.2, Math.sin(a) * R),
        offset: (i * PERIOD) / n,
      };
    });
  }, [mobile]);

  return (
    <group>
      {sparks.map((s, i) => (
        <Spark key={i} from={s.from} to={s.to} offset={s.offset} />
      ))}
    </group>
  );
};

/* ---------- the scene ---------- */
const DataOrb = () => {
  const { size } = useThree();
  const mobile = size.width < 768;
  const scale = mobile ? 0.7 : 1;

  const mats = useMemo<Mats>(() => {
    const uniforms = {
      uTime: { value: 0 },
      uStrike: { value: 0 },
      uRed: { value: new THREE.Vector3(1.0, 0.24, 0.16) },
      uAmber: { value: new THREE.Vector3(1.0, 0.72, 0.0) },
      uHot: { value: new THREE.Vector3(1.0, 0.95, 0.85) },
    };
    return {
      uniforms,
      wire: new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: WIRE_FRAG }),
      rim: new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: RIM_FRAG }),
    };
  }, []);

  useEffect(
    () => () => {
      mats.wire.dispose();
      mats.rim.dispose();
    },
    [mats]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mats.uniforms.uTime.value = t;
    mats.uniforms.uStrike.value = strikeAt(t);
  });

  return (
    <group scale={scale} position={[0, mobile ? 0.2 : 0.3, 0]} rotation={[0.42, 0, 0]}>
      <FloorFx />
      <PcbBoard mobile={mobile} />
      <PhaseWaves half={mobile ? 3.0 : 5.5} />
      <Coil mats={mats} mobile={mobile} />
      <FieldLines mobile={mobile} />
      <Discharges mobile={mobile} />
    </group>
  );
};

export default DataOrb;