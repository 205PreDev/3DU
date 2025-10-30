import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { PitchParameters } from '@/types'

interface Pitcher3DProps {
  params: PitchParameters
  isPitching: boolean
  animationProgress: number // 0~1 (0: 준비, 1: 릴리스 완료)
}

/**
 * 간단한 투수 모델 (본 애니메이션)
 * 릴리스 포인트, 투구 각도에 따라 팔/손 동작 변화
 */
export function Pitcher3D({ params, isPitching, animationProgress }: Pitcher3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const upperArmRef = useRef<THREE.Mesh>(null)
  const forearmRef = useRef<THREE.Mesh>(null)
  const handRef = useRef<THREE.Mesh>(null)

  // 투구 폼 타입 결정 (릴리스 포인트 Y 기준)
  const pitchingStyle = useMemo(() => {
    const releaseY = params.initial.releasePoint.y
    if (releaseY >= 1.9) return 'overhand'
    if (releaseY >= 1.5) return 'sidearm'
    return 'underhand'
  }, [params.initial.releasePoint.y])

  // 애니메이션 각도 계산
  const { shoulderAngle, elbowAngle, wristAngle } = useMemo(() => {
    const releaseX = params.initial.releasePoint.x
    const verticalAngle = params.initial.angle.vertical

    // 투구 폼별 기본 각도
    let baseShoulderAngle = 0
    let baseElbowAngle = 0

    switch (pitchingStyle) {
      case 'overhand':
        baseShoulderAngle = Math.PI * 0.5 // 90도 (팔 위로)
        baseElbowAngle = -Math.PI * 0.3 // 팔꿈치 구부림
        break
      case 'sidearm':
        baseShoulderAngle = Math.PI * 0.25 // 45도
        baseElbowAngle = -Math.PI * 0.2
        break
      case 'underhand':
        baseShoulderAngle = -Math.PI * 0.2 // 아래로
        baseElbowAngle = -Math.PI * 0.1
        break
    }

    // 릴리스 포인트 X에 따른 좌우 회전 (우완/좌완)
    const sideRotation = Math.atan2(releaseX, 2.0) // 릴리스 X 위치에 따라 몸통 회전

    // 애니메이션 진행에 따른 각도 변화
    const progress = animationProgress
    const shoulderSwing = Math.sin(progress * Math.PI) * (Math.PI * 0.4) // 어깨 스윙
    const elbowExtension = progress * (Math.PI * 0.3) // 팔꿈치 펴기

    return {
      shoulderAngle: baseShoulderAngle + shoulderSwing,
      elbowAngle: baseElbowAngle + elbowExtension,
      wristAngle: verticalAngle * (Math.PI / 180), // 투구 각도 반영
      sideRotation
    }
  }, [params, pitchingStyle, animationProgress])

  // 투수 위치 (마운드 위)
  const pitcherPosition: [number, number, number] = [0, 0, 0]

  // 팔 길이 파라미터
  const UPPER_ARM_LENGTH = 0.3
  const FOREARM_LENGTH = 0.3
  const HAND_LENGTH = 0.15

  return (
    <group ref={groupRef} position={pitcherPosition}>
      {/* 몸통 (간단한 원기둥) */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>

      {/* 머리 */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#f5deb3" />
      </mesh>

      {/* 다리 (왼쪽) */}
      <mesh position={[-0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 6]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>

      {/* 다리 (오른쪽) */}
      <mesh position={[0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 6]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>

      {/* 투구 팔 (우완 기준, releaseX 음수면 좌완) */}
      <group position={[params.initial.releasePoint.x > 0 ? 0.2 : -0.2, 1.3, 0]}>
        {/* 상완 (어깨~팔꿈치) */}
        <group rotation={[shoulderAngle, 0, params.initial.releasePoint.x > 0 ? 0.3 : -0.3]}>
          <mesh
            ref={upperArmRef}
            position={[0, -UPPER_ARM_LENGTH / 2, 0]}
          >
            <cylinderGeometry args={[0.05, 0.05, UPPER_ARM_LENGTH, 6]} />
            <meshStandardMaterial color="#f5deb3" />
          </mesh>

          {/* 전완 (팔꿈치~손목) */}
          <group position={[0, -UPPER_ARM_LENGTH, 0]} rotation={[elbowAngle, 0, 0]}>
            <mesh
              ref={forearmRef}
              position={[0, -FOREARM_LENGTH / 2, 0]}
            >
              <cylinderGeometry args={[0.04, 0.04, FOREARM_LENGTH, 6]} />
              <meshStandardMaterial color="#f5deb3" />
            </mesh>

            {/* 손 */}
            <group position={[0, -FOREARM_LENGTH, 0]} rotation={[wristAngle, 0, 0]}>
              <mesh
                ref={handRef}
                position={[0, -HAND_LENGTH / 2, 0]}
              >
                <boxGeometry args={[0.08, HAND_LENGTH, 0.04]} />
                <meshStandardMaterial color="#f5deb3" />
              </mesh>

              {/* 공 (릴리스 전에만 표시) */}
              {!isPitching && (
                <mesh position={[0, -HAND_LENGTH, 0]}>
                  <sphereGeometry args={[0.037, 8, 8]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
              )}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
