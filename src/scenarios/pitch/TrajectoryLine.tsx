import { useMemo } from 'react'
import { Vector3 as ThreeVector3 } from 'three'
import { Line } from '@react-three/drei'
import { Vector3 } from '@/types'

interface TrajectoryLineProps {
  points: Vector3[]
  color?: string
  lineWidth?: number
}

/**
 * 투구 궤적 라인
 */
export function TrajectoryLine({
  points,
  color = '#ff4444',
  lineWidth = 2
}: TrajectoryLineProps) {
  const threePoints = useMemo(() => {
    return points.map(p => new ThreeVector3(p.x, p.y, p.z))
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
}

/**
 * 완료된 궤적 라인 (파란색)
 */
export function CompletedTrajectoryLine({ points }: { points: Vector3[] }) {
  return (
    <TrajectoryLine
      points={points}
      color="#4444ff"
      lineWidth={3}
    />
  )
}
