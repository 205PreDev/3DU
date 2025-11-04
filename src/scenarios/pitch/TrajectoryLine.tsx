import { useMemo, memo } from 'react'
import { Vector3 as ThreeVector3 } from 'three'
import { Line } from '@react-three/drei'
import { Vector3, TrajectoryPoint } from '@/types'

interface TrajectoryLineProps {
  points: Vector3[] | TrajectoryPoint[]
  color?: string
  lineWidth?: number
}

/**
 * 투구 궤적 라인 (성능 최적화: memo)
 */
export const TrajectoryLine = memo(function TrajectoryLine({
  points,
  color = '#ff4444',
  lineWidth = 2
}: TrajectoryLineProps) {
  const threePoints = useMemo(() => {
    return points.map(p => {
      // TrajectoryPoint 타입인지 Vector3 타입인지 확인
      const pos = 'position' in p ? p.position : p
      return new ThreeVector3(pos.x, pos.y, pos.z)
    })
  }, [points])

  if (points.length < 2) return null

  return (
    <Line
      points={threePoints}
      color={color}
      lineWidth={lineWidth}
      dashed={false}
    />
  )
})

/**
 * 완료된 궤적 라인 (파란색, 성능 최적화: memo)
 */
export const CompletedTrajectoryLine = memo(function CompletedTrajectoryLine({ points }: { points: Vector3[] | TrajectoryPoint[] }) {
  return (
    <TrajectoryLine
      points={points}
      color="#4444ff"
      lineWidth={3}
    />
  )
})
