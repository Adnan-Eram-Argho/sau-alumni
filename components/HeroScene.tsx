"use client";

import { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// ---------- Organic floating seed/leaf shapes ----------
function OrganicShape({
  position,
  scale,
  color,
  speed,
  distort,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  distort: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.2;
      meshRef.current.rotation.y += speed * 0.002;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.6}
          distort={distort}
          speed={speed * 0.5}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

// ---------- Particle field — pollen/seed/nature evoke ----------
function ParticleField({ count = 600 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
      points.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlePositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#4ade80"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ---------- Scene composition ----------
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} />
      <pointLight position={[-3, 2, -2]} intensity={0.3} color="#4ade80" />

      {/* Primary organic shapes — evoking seeds/leaves */}
      <OrganicShape
        position={[3, 0.5, -1]}
        scale={1.2}
        color="#2a7d52"
        speed={1.5}
        distort={0.4}
      />
      <OrganicShape
        position={[-3.5, -0.8, -2]}
        scale={0.9}
        color="#1e5c3a"
        speed={1.2}
        distort={0.5}
      />
      <OrganicShape
        position={[1, -1.5, -3]}
        scale={0.6}
        color="#b45309"
        speed={1.8}
        distort={0.3}
      />

      <ParticleField count={500} />
    </>
  );
}

// ---------- Gradient fallback for mobile/low-end ----------
function GradientFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient circles */}
      <div
        className="absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, #4ade80 0%, transparent 70%)",
          animation: "float-slow 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, #2a7d52 0%, transparent 70%)",
          animation: "float-slow 10s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, #fbbf24 0%, transparent 70%)",
          animation: "float-slow 12s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}

// ---------- Main export — lazy-loadable ----------
export default function HeroScene() {
  const [canRender3D, setCanRender3D] = useState(false);

  useEffect(() => {
    // Device capability check — mobile/low-end gets fallback
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 2;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!isMobile && hardwareConcurrency >= 4 && !prefersReduced) {
      setCanRender3D(true);
    }
  }, []);

  if (!canRender3D) {
    return <GradientFallback />;
  }

  return (
    <div className="absolute inset-0">
      <Suspense fallback={<GradientFallback />}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 1.5]}
          style={{ pointerEvents: "none" }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
