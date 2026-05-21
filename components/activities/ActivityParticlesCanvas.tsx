'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const COUNT = 1200 // Number of particles for sweet-spot density & performance

// Pre-calculate positions and colors for 6 states
const generateStates = () => {
  const states: Float32Array[] = []
  const colors: Float32Array[] = []

  // Tailored aesthetic colors for each activity
  const palette = [
    { r: 52 / 255, g: 211 / 255, b: 153 / 255 },  // Emerald (Mountain trekking)
    { r: 245 / 255, g: 158 / 255, b: 11 / 255 },  // Gold (Sacred campfire)
    { r: 244 / 255, g: 63 / 255, b: 94 / 255 },   // Rose (Valle del Luna rappel)
    { r: 16 / 255, g: 185 / 255, b: 129 / 255 },  // Mint (Cloud Forest)
    { r: 56 / 255, g: 189 / 255, b: 248 / 255 },  // Sky Blue (Titicaca kayak)
    { r: 139 / 255, g: 92 / 255, b: 246 / 255 },  // Violet (Altiplano stargazing)
  ]

  for (let s = 0; s < 6; s++) {
    const pos = new Float32Array(COUNT * 3)
    const col = new Float32Array(COUNT * 3)
    const colorObj = palette[s]

    for (let i = 0; i < COUNT; i++) {
      let x = 0, y = 0, z = 0

      if (s === 0) {
        // State 0: Montaña (Conical mountain terrain profile)
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 4.5
        y = Math.max(0, 3.2 - 0.7 * radius) + (Math.random() - 0.5) * 0.4 - 1.2
        x = Math.cos(angle) * radius
        z = Math.sin(angle) * radius
      } else if (s === 1) {
        // State 1: Fogata (Rising flame vortex)
        const angle = i * 0.06 + Math.random() * 0.2
        const height = Math.random() * 5 - 2
        const radius = (height + 2) * 0.28 + 0.15
        x = Math.cos(angle) * radius
        y = height
        z = Math.sin(angle) * radius
      } else if (s === 2) {
        // State 2: Cañón Valle de la Luna (Two steep craggy canyon walls)
        const side = Math.random() > 0.5 ? 1 : -1
        x = side * (1.8 + Math.random() * 2.2)
        z = (Math.random() - 0.5) * 5
        y = Math.sin(z * 0.9) * 0.4 + Math.random() * 2.8 - 1.4
      } else if (s === 3) {
        // State 3: Selva Amboró (Swirling dense cloud forest sphere)
        const u = Math.random()
        const th = Math.acos(2 * u - 1)
        const ph = Math.random() * Math.PI * 2
        const radius = 1.3 + Math.random() * 2.3
        x = radius * Math.sin(th) * Math.cos(ph)
        y = radius * Math.sin(th) * Math.sin(ph)
        z = radius * Math.cos(th)
      } else if (s === 4) {
        // State 4: Lago Titicaca (Rippling plane horizontal grid representing waves)
        const u = Math.random() * 6 - 3
        const v = Math.random() * 6 - 3
        x = u
        z = v
        y = Math.sin(u * 1.4) * Math.cos(v * 1.4) * 0.4 - 1.2
      } else {
        // State 5: Stargazing (Wide celestial dome above)
        const angle = Math.random() * Math.PI * 2
        const elev = Math.random() * Math.PI * 0.5 // Above horizon only
        const radius = 4.8 + Math.random() * 0.4
        x = radius * Math.cos(elev) * Math.cos(angle)
        y = radius * Math.sin(elev) - 1.4
        z = radius * Math.cos(elev) * Math.sin(angle)
      }

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      // Blend with subtle variations
      const tint = Math.random() * 0.22 - 0.11
      col[i * 3] = Math.max(0, Math.min(1, colorObj.r + tint))
      col[i * 3 + 1] = Math.max(0, Math.min(1, colorObj.g + tint))
      col[i * 3 + 2] = Math.max(0, Math.min(1, colorObj.b + tint))
    }

    states.push(pos)
    colors.push(col)
  }

  return { states, colors }
}

interface ParticlesSceneProps {
  scrollProgressRef: React.RefObject<{ val: number }>
}

function ParticlesScene({ scrollProgressRef }: ParticlesSceneProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { states, colors } = useMemo(() => generateStates(), [])

  // Initialize buffer arrays
  const initialPositions = useMemo(() => new Float32Array(COUNT * 3), [])
  const initialColors = useMemo(() => new Float32Array(COUNT * 3), [])

  useFrame((state) => {
    if (!pointsRef.current) return

    // Get the scrubbed scroll index (ranges from 0.0 to 5.0)
    const val = scrollProgressRef.current ? scrollProgressRef.current.val : 0
    const stateIdx = Math.max(0, Math.min(Math.floor(val), 4))
    const nextStateIdx = Math.min(stateIdx + 1, 5)
    const frac = Math.max(0, Math.min(val - stateIdx, 1))

    const posAttr = pointsRef.current.geometry.attributes.position
    const colAttr = pointsRef.current.geometry.attributes.color

    const time = state.clock.getElapsedTime()

    for (let i = 0; i < COUNT; i++) {
      // Retrieve coords from adjacent states
      const x1 = states[stateIdx][i * 3]
      const y1 = states[stateIdx][i * 3 + 1]
      const z1 = states[stateIdx][i * 3 + 2]

      const x2 = states[nextStateIdx][i * 3]
      const y2 = states[nextStateIdx][i * 3 + 1]
      const z2 = states[nextStateIdx][i * 3 + 2]

      // Perform smooth linear morphing between states
      let x = THREE.MathUtils.lerp(x1, x2, frac)
      let y = THREE.MathUtils.lerp(y1, y2, frac)
      let z = THREE.MathUtils.lerp(z1, z2, frac)

      // Add state-specific dynamic micro-animations to look alive
      if (stateIdx === 1 && frac < 0.5) {
        // Campfire vortex rising
        y += Math.sin(time * 3.5 + i) * 0.15
        x += Math.sin(time * 2 + i * 0.6) * 0.04
        z += Math.cos(time * 2 + i * 0.6) * 0.04
      } else if (stateIdx === 4 || (stateIdx === 3 && frac > 0.5)) {
        // Titicaca waves undulating
        y += Math.sin(time * 1.8 + x * 1.5 + z * 1.5) * 0.1
      } else {
        // General floating noise
        x += Math.sin(time * 0.6 + i) * 0.05
        y += Math.cos(time * 0.5 + i) * 0.05
        z += Math.sin(time * 0.4 + i) * 0.05
      }

      posAttr.setXYZ(i, x, y, z)

      // Color transition
      const r1 = colors[stateIdx][i * 3]
      const g1 = colors[stateIdx][i * 3 + 1]
      const b1 = colors[stateIdx][i * 3 + 2]

      const r2 = colors[nextStateIdx][i * 3]
      const g2 = colors[nextStateIdx][i * 3 + 1]
      const b2 = colors[nextStateIdx][i * 3 + 2]

      colAttr.setXYZ(
        i,
        THREE.MathUtils.lerp(r1, r2, frac),
        THREE.MathUtils.lerp(g1, g2, frac),
        THREE.MathUtils.lerp(b1, b2, frac)
      )
    }

    posAttr.needsUpdate = true
    colAttr.needsUpdate = true

    // Subtle automatic rotation to display 3D depth
    pointsRef.current.rotation.y = time * 0.02 + val * 0.18
    pointsRef.current.rotation.x = Math.sin(time * 0.08) * 0.05 + val * 0.04
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[initialPositions, 3]} />
        <bufferAttribute attach="attributes-color" args={[initialColors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={0.88}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

interface ActivityParticlesCanvasProps {
  scrollProgressRef: React.RefObject<{ val: number }>
  isMobile?: boolean
}

export default function ActivityParticlesCanvas({
  scrollProgressRef,
  isMobile = false,
}: ActivityParticlesCanvasProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 4.5, 9.5], fov: 48 }}
        gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
        dpr={isMobile ? 1 : [1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[8, 8, 8]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-8, -5, -8]} intensity={0.7} color="#d4a574" />

        <ParticlesScene scrollProgressRef={scrollProgressRef} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
        />
      </Canvas>

      {/* Decorative center overlay ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-emerald-500/5 pointer-events-none radial-ring" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22rem] h-[22rem] rounded-full border border-emerald-500/2 pointer-events-none radial-ring opacity-50" />
    </div>
  )
}
