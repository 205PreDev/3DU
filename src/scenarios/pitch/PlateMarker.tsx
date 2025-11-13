import { memo } from 'react'
import { PHYSICS_CONSTANTS } from '@/types'

interface PlateMarkerProps {
  x: number
  y: number
  color?: string
}

/**
 * 공이 스트라이크 존 위치에 도달했을 때의 충돌면 마커
 * 반투명 원으로 표시
 */
export const PlateMarker = memo(function PlateMarker({
  x,
  y,
  color = '#00ff00'
}: PlateMarkerProps) {
  const plateZ = -PHYSICS_CONSTANTS.MOUND_TO_PLATE

  return (
    <mesh position={[x, y, plateZ]} rotation={[0, 0, 0]}>
      <circleGeometry args={[0.04, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.7}
        side={2} // DoubleSide
      />
    </mesh>
  )
})

interface PlateMarkerListProps {
  markers: Array<{ x: number; y: number; color?: string }>
}

/**
 * 여러 마커를 동시에 표시
 */
export const PlateMarkerList = memo(function PlateMarkerList({
  markers
}: PlateMarkerListProps) {
  return (
    <group>
      {markers.map((marker, index) => (
        <PlateMarker
          key={index}
          x={marker.x}
          y={marker.y}
          color={marker.color}
        />
      ))}
    </group>
  )
})
