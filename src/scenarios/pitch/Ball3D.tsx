import { memo } from 'react'
import { Vector3 } from '@/types'
import { useGraphics } from '@/contexts/GraphicsContext'

interface Ball3DProps {
  position?: Vector3
  radius?: number
  color?: string
}

/**
 * 야구공 3D 모델 (성능 최적화: memo, 폴리곤 감소, useFrame 제거로 떨림 방지)
 */
export const Ball3D = memo(function Ball3D({
  position = { x: 0, y: 0, z: 0 },
  radius = 0.0366,  // 야구공 반지름 (m)
  color = '#ffffff'
}: Ball3DProps) {
  const { settings } = useGraphics()

  return (
    <mesh position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[radius, settings.sphereSegments, settings.sphereSegments]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
})
