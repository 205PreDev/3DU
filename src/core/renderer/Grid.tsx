import { Grid as DreiGrid } from '@react-three/drei'

/**
 * 바닥 그리드 헬퍼
 */
export function Grid() {
  return (
    <>
      {/* XZ 평면 그리드 (성능 최적화: 50x50 → 20x20) */}
      <DreiGrid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={20}
        fadeStrength={1}
        followCamera={false}
        position={[0, 0, 0]}
      />

      {/* 좌표축 헬퍼 */}
      <axesHelper args={[3]} />
    </>
  )
}
