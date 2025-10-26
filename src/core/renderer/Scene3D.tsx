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
      dpr={[1, 1]}  // 픽셀 밀도 1배 고정 (성능 최우선)
      performance={{ min: 0.5 }}  // 성능 우선 모드
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      }}
    >
      {/* BasicMaterial 사용으로 조명 최소화 */}
      <ambientLight intensity={0.8} />

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
