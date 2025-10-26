import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 as ThreeVector3 } from 'three'
import { CameraPreset } from '@/contexts/SimulationContext'
import { Vector3 } from '@/types'

interface CameraControllerProps {
  preset: CameraPreset
  ballPosition?: Vector3  // follow 모드용
}

interface CameraConfig {
  position: [number, number, number]
  target: [number, number, number]
}

// 카메라 프리셋 정의
const CAMERA_PRESETS: Record<CameraPreset, CameraConfig | null> = {
  // 포수 시점: 홈플레이트 뒤에서 마운드 쪽을 바라봄
  catcher: {
    position: [0, 1.5, -19],  // 홈플레이트 뒤쪽
    target: [0, 1.8, 0]        // 마운드(투수) 쪽을 바라봄
  },
  // 투수 시점: 마운드 뒤쪽에서 릴리스 포인트와 스트라이크존을 바라봄
  pitcher: {
    position: [0, 1.8, 2],     // 마운드 뒤쪽 (릴리스 포인트가 잘 보임)
    target: [0, 1.2, -18.44]   // 스트라이크존을 바라봄
  },
  // 측면 시점: x축으로 떨어진 곳에서 z축과 수직으로 마운드-홈플레이트 구간을 봄
  side: {
    position: [10, 2, -9],     // x축으로 10m 떨어진 측면
    target: [0, 1.2, -9]       // 중간 지점을 바라봄
  },
  follow: null,  // 동적으로 처리
  free: null     // OrbitControls 사용
}

/**
 * 카메라 프리셋 제어 컴포넌트
 * 다양한 시점에서 궤적을 관찰
 */
export function CameraController({ preset, ballPosition }: CameraControllerProps) {
  const { camera } = useThree()
  const targetPos = useRef(new ThreeVector3())
  const currentPos = useRef(new ThreeVector3())

  // 프리셋 변경 시 카메라 위치 설정
  useEffect(() => {
    if (preset === 'follow' || preset === 'free') return

    const config = CAMERA_PRESETS[preset]
    if (!config) return

    // 목표 위치 설정
    targetPos.current.set(...config.position)
    currentPos.current.copy(camera.position)

    // 즉시 카메라 lookAt 적용
    camera.lookAt(...config.target)
  }, [preset, camera])

  // 부드러운 카메라 전환 애니메이션
  useFrame((_state, delta) => {
    if (preset === 'free') return  // OrbitControls에 맡김

    // follow 모드: 공 추적 (카메라는 고정, 회전만 부드럽게)
    if (preset === 'follow' && ballPosition) {
      // 카메라는 약간 뒤쪽에서 공을 추적
      const offsetDistance = 5
      const heightOffset = 3

      targetPos.current.set(
        ballPosition.x,
        ballPosition.y + heightOffset,
        ballPosition.z + offsetDistance
      )

      // 카메라 lookAt을 부드럽게 (Slerp 효과)
      const targetLookAt = new ThreeVector3(ballPosition.x, ballPosition.y, ballPosition.z)
      const currentLookAt = new ThreeVector3(0, 0, -1)
        .applyQuaternion(camera.quaternion)
        .add(camera.position)

      currentLookAt.lerp(targetLookAt, Math.min(delta * 5, 0.3))  // 부드러운 회전
      camera.lookAt(currentLookAt)
    }

    // Lerp로 부드러운 이동 (0.5초 전환)
    const lerpFactor = Math.min(delta * 2, 1)
    camera.position.lerp(targetPos.current, lerpFactor)
  })

  return null
}
