import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const BASE_COLOR = '#8a8f98'
const HOVER_COLOR = '#4fa3ff'
const SELECTED_COLOR = '#ff6b35'

const REGIONS = [
  { key: 'head', label: 'Head' },
  { key: 'chest', label: 'Chest' },
  { key: 'core', label: 'Core' },
  { key: 'leftArm', label: 'Left arm' },
  { key: 'rightArm', label: 'Right arm' },
  { key: 'leftLeg', label: 'Left leg' },
  { key: 'rightLeg', label: 'Right leg' },
  { key: 'back', label: 'Back' },
]

function RegionMesh({ regionKey, onHover, onSelect, children }) {
  return (
    <group
      onClick={(e) => {
        e.stopPropagation()
        onSelect(regionKey)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(regionKey)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        onHover(null)
      }}
    >
      {children()}
    </group>
  )
}

function Humanoid({ selected, hovered, onHover, onSelect }) {
  const isSelected = (key) => selected.includes(key)
  const isHovered = (key) => hovered === key

  const material = (key) => (
    <meshStandardMaterial
      color={isSelected(key) ? SELECTED_COLOR : isHovered(key) ? HOVER_COLOR : BASE_COLOR}
      emissive={isSelected(key) ? SELECTED_COLOR : isHovered(key) ? HOVER_COLOR : '#000000'}
      emissiveIntensity={isSelected(key) ? 0.9 : isHovered(key) ? 0.3 : 0}
    />
  )

  return (
    <group>
      {/* head */}
      <RegionMesh regionKey="head" selected={isSelected('head')} hovered={isHovered('head')} onHover={onHover} onSelect={onSelect}>
        {() => (
          <mesh position={[0, 1.55, 0]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            {material('head')}
          </mesh>
        )}
      </RegionMesh>

      {/* chest */}
      <RegionMesh regionKey="chest" selected={isSelected('chest')} hovered={isHovered('chest')} onHover={onHover} onSelect={onSelect}>
        {() => (
          <mesh position={[0, 1.02, 0]}>
            <boxGeometry args={[0.62, 0.55, 0.32]} />
            {material('chest')}
          </mesh>
        )}
      </RegionMesh>

      {/* back (thin box behind chest) */}
      <RegionMesh regionKey="back" selected={isSelected('back')} hovered={isHovered('back')} onHover={onHover} onSelect={onSelect}>
        {() => (
          <mesh position={[0, 1.02, -0.2]}>
            <boxGeometry args={[0.6, 0.55, 0.1]} />
            {material('back')}
          </mesh>
        )}
      </RegionMesh>

      {/* core */}
      <RegionMesh regionKey="core" selected={isSelected('core')} hovered={isHovered('core')} onHover={onHover} onSelect={onSelect}>
        {() => (
          <mesh position={[0, 0.62, 0]}>
            <boxGeometry args={[0.46, 0.32, 0.28]} />
            {material('core')}
          </mesh>
        )}
      </RegionMesh>

      {/* left arm */}
      <RegionMesh regionKey="leftArm" selected={isSelected('leftArm')} hovered={isHovered('leftArm')} onHover={onHover} onSelect={onSelect}>
        {() => (
          <mesh position={[-0.46, 0.95, 0]} rotation={[0, 0, 0.12]}>
            <capsuleGeometry args={[0.09, 0.75, 4, 8]} />
            {material('leftArm')}
          </mesh>
        )}
      </RegionMesh>

      {/* right arm */}
      <RegionMesh regionKey="rightArm" selected={isSelected('rightArm')} hovered={isHovered('rightArm')} onHover={onHover} onSelect={onSelect}>
        {() => (
          <mesh position={[0.46, 0.95, 0]} rotation={[0, 0, -0.12]}>
            <capsuleGeometry args={[0.09, 0.75, 4, 8]} />
            {material('rightArm')}
          </mesh>
        )}
      </RegionMesh>

      {/* left leg */}
      <RegionMesh regionKey="leftLeg" selected={isSelected('leftLeg')} hovered={isHovered('leftLeg')} onHover={onHover} onSelect={onSelect}>
        {() => (
          <mesh position={[-0.16, -0.15, 0]}>
            <capsuleGeometry args={[0.12, 0.85, 4, 8]} />
            {material('leftLeg')}
          </mesh>
        )}
      </RegionMesh>

      {/* right leg */}
      <RegionMesh regionKey="rightLeg" selected={isSelected('rightLeg')} hovered={isHovered('rightLeg')} onHover={onHover} onSelect={onSelect}>
        {() => (
          <mesh position={[0.16, -0.15, 0]}>
            <capsuleGeometry args={[0.12, 0.85, 4, 8]} />
            {material('rightLeg')}
          </mesh>
        )}
      </RegionMesh>
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
        <Canvas camera={{ position: [0, 0.8, 3], fov: 40 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 3, 2]} intensity={1} />
          <Humanoid selected={selected} hovered={hovered} onHover={setHovered} onSelect={toggleRegion} />
          <OrbitControls
            target={[0, 0.7, 0]}
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
