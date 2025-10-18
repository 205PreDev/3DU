import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ReactNode } from 'react'

interface Scene3DProps {
  children?: ReactNode
}

/**
 * 메인 3D 씬 컴포넌트
 * Three.js Canvas와 기본 조명, 카메라 설정
 */
export function Scene3D({ children }: Scene3DProps) {
  return (
    <Canvas
      camera={{
        position: [5, 3, 15],
        fov: 50,
        near: 0.1,
        far: 1000
      }}
      shadows
      style={{ background: '#1a1a2e' }}
    >
      {/* 환경 조명 */}
      <ambientLight intensity={0.4} />

      {/* 주 조명 (그림자 포함) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* 보조 조명 */}
      <pointLight position={[-10, 5, -10]} intensity={0.3} />

      {/* 카메라 컨트롤 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />

      {/* 자식 컴포넌트 렌더링 */}
      {children}
    </Canvas>
  )
}
