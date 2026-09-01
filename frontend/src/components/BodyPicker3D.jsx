import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html } from '@react-three/drei'

const HOVER_COLOR = '#4fa3ff'
const SELECTED_COLOR = '#ff6b35'

// Hitbox geometry + placement, hand-measured against the real body-model.gltf
// mesh bounds (Worker_Body y 1.01-1.56, Worker_Head y 1.45-1.86, Worker_Legs
// y 0.14-1.04) since the model has no per-region mesh nodes to raycast
// directly against (see Phase 8 report).
const REGIONS = [
  { key: 'head', label: 'Head', shape: 'sphere', args: [0.15], position: [0, 1.74, 0.05] },
  { key: 'chest', label: 'Chest', shape: 'box', args: [0.34, 0.26, 0.2], position: [0, 1.45, 0.1] },
  { key: 'core', label: 'Core', shape: 'box', args: [0.34, 0.26, 0.18], position: [0, 1.2, 0.08] },
  { key: 'back', label: 'Back', shape: 'box', args: [0.4, 0.52, 0.12], position: [0, 1.33, -0.07] },
  { key: 'leftArm', label: 'Left arm', shape: 'box', args: [0.18, 0.7, 0.2], position: [-0.27, 1.23, 0.05] },
  { key: 'rightArm', label: 'Right arm', shape: 'box', args: [0.18, 0.7, 0.2], position: [0.27, 1.23, 0.05] },
  { key: 'leftLeg', label: 'Left leg', shape: 'box', args: [0.24, 0.94, 0.26], position: [-0.13, 0.61, 0.05] },
  { key: 'rightLeg', label: 'Right leg', shape: 'box', args: [0.24, 0.94, 0.26], position: [0.13, 0.61, 0.05] },
]

function Model() {
  const { scene } = useGLTF('/models/body-model.gltf')
  return <primitive object={scene} />
}

function RegionGeometry({ shape, args }) {
  if (shape === 'sphere') return <sphereGeometry args={[args[0], 16, 16]} />
  return <boxGeometry args={args} />
}

function Region({ region, isSelected, isHovered, onHover, onSelect }) {
  const state = isSelected ? 'selected' : isHovered ? 'hovered' : 'idle'

  return (
    <group
      position={region.position}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(region.key)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(region.key)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onHover(null)
      }}
    >
      {/* invisible but raycastable hitbox */}
      <mesh>
        <RegionGeometry shape={region.shape} args={region.args} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* visible halo, only rendered on hover/select */}
      {state !== 'idle' && (
        <mesh scale={1.12}>
          <RegionGeometry shape={region.shape} args={region.args} />
          <meshBasicMaterial
            color={state === 'selected' ? SELECTED_COLOR : HOVER_COLOR}
            transparent
            opacity={state === 'selected' ? 0.55 : 0.3}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

function BodyPicker3D({ onSelectionChange }) {
  const [selected, setSelected] = useState([])
  const [hovered, setHovered] = useState(null)
  const [hasRotated, setHasRotated] = useState(false)

  function toggleRegion(key) {
    const next = selected.includes(key) ? selected.filter((r) => r !== key) : [...selected, key]
    setSelected(next)
    onSelectionChange?.(next)
  }

  const selectedLabels = REGIONS.filter((r) => selected.includes(r.key)).map((r) => r.label)

  return (
    <div>
      <h1>Focus Areas</h1>
      <p className="note">Click a region on the model to focus on it. Click again to deselect.</p>

      <div className="canvas-wrap">
        <Canvas camera={{ position: [0, 1.0, 3], fov: 40 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 3, 2]} intensity={1} />
          <Suspense
            fallback={
              <Html center>
                <span className="spinner" />
              </Html>
            }
          >
            <Model />
          </Suspense>
          {REGIONS.map((region) => (
            <Region
              key={region.key}
              region={region}
              isSelected={selected.includes(region.key)}
              isHovered={hovered === region.key}
              onHover={setHovered}
              onSelect={toggleRegion}
            />
          ))}
          <OrbitControls
            target={[0, 0.9, 0]}
            enablePan={false}
            minDistance={1.5}
            maxDistance={5}
            onStart={() => setHasRotated(true)}
          />
        </Canvas>
        <div className={`rotate-hint${hasRotated ? ' rotate-hint-hidden' : ''}`}>Drag to rotate ↻</div>
      </div>

      <p className="note">
        Selected: {selectedLabels.length > 0 ? selectedLabels.join(', ') : 'None'}
      </p>
    </div>
  )
}

export default BodyPicker3D
