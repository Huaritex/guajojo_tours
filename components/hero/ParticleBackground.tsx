'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function terrainNoise(x: number, z: number): number {
  return (
    Math.sin(x * 0.4) * Math.cos(z * 0.3) * 3.5 +
    Math.sin(x * 1.1 + z * 0.7) * 1.2 +
    Math.sin(x * 2.3 - z * 1.4) * 0.5 +
    Math.cos(x * 0.7 + z * 1.6) * 0.9 +
    Math.sin(x * 3.5 + z * 2.1) * 0.3
  )
}

interface TerrainProps {
  segments?: number
}

function Terrain({ segments = 128 }: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(24, 24, segments, segments)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      pos.setY(i, terrainNoise(x, z))
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }, [segments])

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.04
  })

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#064e3b"
        wireframe
        transparent
        opacity={0.55}
      />
    </mesh>
  )
}

function Particles() {
  const count = 600
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, colors, baseY } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const baseY = new Float32Array(count)
    const gold = new THREE.Color('#d4a574')
    const emerald = new THREE.Color('#34d399')

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 14
      const y = Math.random() * 10 - 2
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = Math.sin(angle) * radius
      baseY[i] = y

      const c = Math.random() > 0.6 ? emerald : gold
      colors[i * 3] = c.r * (0.7 + Math.random() * 0.3)
      colors[i * 3 + 1] = c.g * (0.7 + Math.random() * 0.3)
      colors[i * 3 + 2] = c.b * (0.7 + Math.random() * 0.3)
    }
    return { positions, colors, baseY }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015
    const pos = pointsRef.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      pos.setY(i, baseY[i] + Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1) * 0.15)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  )
}

function Scene({ isMobile }: { isMobile: boolean }) {
  const segments = isMobile ? 64 : 128

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#34d399" />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#d4a574" />

      <Terrain segments={segments} />
      <Particles />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
      />
    </>
  )
}

interface ParticleBackgroundProps {
  isMobile?: boolean
}

export default function ParticleBackground({ isMobile = false }: ParticleBackgroundProps) {
  return (
    <Canvas
      camera={{ position: [0, 8, 16], fov: 55 }}
      gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
      dpr={isMobile ? 1 : [1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <Scene isMobile={isMobile} />
    </Canvas>
  )
}
