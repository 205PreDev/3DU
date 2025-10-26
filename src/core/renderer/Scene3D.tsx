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
        far: 50
      }}
      style={{ background: '#1a1a2e' }}
    >
      {/* 환경 조명 */}
      <ambientLight intensity={0.5} />

      {/* 주 조명 (그림자 제거로 성능 향상) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
      />

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
