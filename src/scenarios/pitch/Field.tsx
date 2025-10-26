import { PHYSICS_CONSTANTS } from '@/types'

/**
 * 야구장 바닥 및 마운드/플레이트 표시
 */
export function Field() {
  const moundToPlate = PHYSICS_CONSTANTS.MOUND_TO_PLATE

  return (
    <group>
      {/* 바닥 평면 (성능 최적화: 그림자 제거) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#2d5016" />
      </mesh>

      {/* 투수판 (마운드) */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.15]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>

      {/* 홈 플레이트 */}
      <mesh position={[0, 0.02, -moundToPlate]}>
        <boxGeometry args={[0.43, 0.04, 0.43]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 스트라이크 존 표시 (반투명 박스) */}
      <mesh position={[0, 0.8, -moundToPlate]}>
        <boxGeometry args={[0.44, 0.6, 0.02]} />
        <meshStandardMaterial
          color="#ffff00"
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>

      {/* 투수-포수 연결선 */}
      <mesh position={[0, 0.01, -moundToPlate / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, moundToPlate]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
