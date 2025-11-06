import { memo, useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { Vector3 as Vec3Type } from '@/types'
import { ArrowHelper } from 'three'
import { useThree } from '@react-three/fiber'

interface ForceVectors3DProps {
  position: Vec3Type
  forces: {
    gravity: Vec3Type
    drag: Vec3Type
    magnus: Vec3Type
  }
  scale?: number  // 힘 벡터 시각화 스케일 (기본값: 0.1)
  experimentId?: string  // 비교 모드에서 실험 구분용 (A/B)
}

/**
 * 힘 벡터 시각화 (중력, 항력, 마그누스)
 * Three.js ArrowHelper 사용
 */
export const ForceVectors3D = memo(function ForceVectors3D({
  position,
  forces,
  scale = 0.1,
  experimentId = 'default'
}: ForceVectors3DProps) {
  const { scene } = useThree()
  const arrowsRef = useRef<ArrowHelper[]>([])

  // ArrowHelper 생성 및 업데이트
  useEffect(() => {
    // 이전 화살표 제거
    arrowsRef.current.forEach(arrow => {
      scene.remove(arrow)
      arrow.dispose()
    })
    arrowsRef.current = []

    const ballPos = new Vector3(position.x, position.y, position.z)
    const ballRadius = 0.037 // 공 반지름 (37mm)

    // 힘 벡터를 Vector3로 변환 및 스케일 적용
    const gravityVec = new Vector3(forces.gravity.x, forces.gravity.y, forces.gravity.z).multiplyScalar(scale)
    const dragVec = new Vector3(forces.drag.x, forces.drag.y, forces.drag.z).multiplyScalar(scale)
    const magnusVec = new Vector3(forces.magnus.x, forces.magnus.y, forces.magnus.z).multiplyScalar(scale)

    // 중력 화살표 (빨강)
    if (gravityVec.length() > 0.001) {
      const gravityDir = gravityVec.clone().normalize()
      const startPos = ballPos.clone().add(gravityDir.clone().multiplyScalar(ballRadius))
      const gravityArrow = new ArrowHelper(
        gravityDir,
        startPos,
        gravityVec.length(),
        0xff0000,  // 빨강
        0.1,       // 머리 길이
        0.05       // 머리 너비
      )
      gravityArrow.userData.isForceArrow = true
      gravityArrow.userData.experimentId = experimentId
      scene.add(gravityArrow)
      arrowsRef.current.push(gravityArrow)
    }

    // 항력 화살표 (파랑)
    if (dragVec.length() > 0.001) {
      const dragDir = dragVec.clone().normalize()
      const startPos = ballPos.clone().add(dragDir.clone().multiplyScalar(ballRadius))
      const dragArrow = new ArrowHelper(
        dragDir,
        startPos,
        dragVec.length(),
        0x0066ff,  // 파랑
        0.1,
        0.05
      )
      dragArrow.userData.isForceArrow = true
      dragArrow.userData.experimentId = experimentId
      scene.add(dragArrow)
      arrowsRef.current.push(dragArrow)
    }

    // 마그누스 화살표 (초록)
    if (magnusVec.length() > 0.001) {
      const magnusDir = magnusVec.clone().normalize()
      const startPos = ballPos.clone().add(magnusDir.clone().multiplyScalar(ballRadius))
      const magnusArrow = new ArrowHelper(
        magnusDir,
        startPos,
        magnusVec.length(),
        0x00ff00,  // 초록
        0.1,
        0.05
      )
      magnusArrow.userData.isForceArrow = true
      magnusArrow.userData.experimentId = experimentId
      scene.add(magnusArrow)
      arrowsRef.current.push(magnusArrow)
    }

    // Cleanup function
    return () => {
      arrowsRef.current.forEach(arrow => {
        scene.remove(arrow)
        arrow.dispose()
      })
      arrowsRef.current = []
    }
  }, [position, forces, scale, experimentId, scene])

  return null
})
