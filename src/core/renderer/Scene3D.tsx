import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ReactNode, useRef } from 'react'
import { CameraPreset, useSimulation } from '@/contexts/SimulationContext'
import { useGraphics } from '@/contexts/GraphicsContext'
import { debugConfig } from '@/core/ui/DebugPanel'

interface Scene3DProps {
  children?: ReactNode
  cameraPreset?: CameraPreset
}

/**
 * 성능 모니터 컴포넌트 (Three.js 내부에서만 작동)
 */
function PerformanceMonitor() {
  const { updatePerformanceMetrics, performanceMetrics } = useSimulation()
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const renderTimesRef = useRef<number[]>([])

  useFrame(() => {
    const now = performance.now()
    const renderTime = now - lastTimeRef.current
    lastTimeRef.current = now

    frameCountRef.current++
    renderTimesRef.current.push(renderTime)

    // 30프레임마다 평균 계산 (약 1초)
    if (frameCountRef.current % 30 === 0) {
      const avgRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length
      const fps = 1000 / avgRenderTime

      const newMetrics = {
        renderTime: avgRenderTime,
        fps,
        frameCount: frameCountRef.current,
        totalFrameTime: (performanceMetrics?.physicsTime || 0) + avgRenderTime
      }

      updatePerformanceMetrics(newMetrics)

      // 콘솔 출력 (30프레임마다 = 약 1초마다)
      if (debugConfig.rendering) {
        console.log(`🎨 렌더링: ${avgRenderTime.toFixed(1)}ms | FPS: ${fps.toFixed(1)} | 프레임: ${frameCountRef.current}`)
      }

      renderTimesRef.current = []
    }
  })

  return null
}

/**
 * 메인 3D 씬 컴포넌트
 * Three.js Canvas와 기본 조명, 카메라 설정
 */
export function Scene3D({ children, cameraPreset = 'free' }: Scene3DProps) {
  const { settings } = useGraphics()

  return (
    <Canvas
      camera={{
        position: [5, 3, 15],
        fov: settings.fov,
        near: 0.1,
        far: 50
      }}
      style={{ background: '#1a1a2e' }}
      dpr={[settings.dpr, settings.dpr]}
      performance={{ min: 0.5 }}
      gl={{
        antialias: settings.antialias,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      }}
      frameloop="always"
    >
      {/* BasicMaterial 사용으로 조명 최소화 */}
      <ambientLight intensity={0.8} />
      {/* 상단 조명 추가 (투수 모델 조명) */}
      <directionalLight
        position={[0, 30, -5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* 카메라 컨트롤 - free 모드일 때만 활성화 */}
      {cameraPreset === 'free' && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2}
        />
      )}

      {/* 성능 모니터 */}
      <PerformanceMonitor />

      {/* 자식 컴포넌트 렌더링 */}
      {children}
    </Canvas>
  )
}
