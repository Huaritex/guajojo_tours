'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WireframeShapes() {
  const groupRef = useRef<THREE.Group>(null)

  const shapes = useMemo(() =>
    Array.from({ length: 9 }, () => ({
      pos: [
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 13,
        -5 - Math.random() * 5,
      ] as [number, number, number],
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      scale: 0.4 + Math.random() * 1.3,
      isGold: Math.random() > 0.55,
    }))
  , [])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.01
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.04) * 0.025
  })

  return (
    <group ref={groupRef}>
      {shapes.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} scale={s.scale}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={s.isGold ? '#d4a574' : '#34d399'}
            wireframe
            transparent
            opacity={0.055}
          />
        </mesh>
      ))}
    </group>
  )
}

function FloatingDust() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const count = 420
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const gold = new THREE.Color('#d4a574')
    const emerald = new THREE.Color('#34d399')

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 28
      positions[i3 + 1] = (Math.random() - 0.5) * 16
      positions[i3 + 2] = (Math.random() - 0.5) * 10 - 2
      const c = Math.random() > 0.5 ? emerald : gold
      const b = 0.45 + Math.random() * 0.55
      colors[i3] = c.r * b
      colors[i3 + 1] = c.g * b
      colors[i3 + 2] = c.b * b
    }
    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.009
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.025) * 0.03
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.042}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  )
}

export default function ConstructorBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1, 10], fov: 52 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={1}
        style={{ background: 'transparent' }}
      >
        <WireframeShapes />
        <FloatingDust />
      </Canvas>
    </div>
  )
}
