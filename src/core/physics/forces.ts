import { Vector3, PitchParameters } from '@/types'
import { vec3 } from './integrator'

/**
 * 중력 계산
 * F = m * g * [0, -1, 0]
 */
export function calculateGravity(mass: number, gravity: number): Vector3 {
  return vec3.create(0, -mass * gravity, 0)
}

/**
 * 항력 계산 (Drag Force)
 * F_drag = -0.5 * ρ * C_d * A * |v|² * v̂
 *
 * @param velocity 속도 벡터 (m/s)
 * @param params 물리 파라미터
 */
export function calculateDrag(
  velocity: Vector3,
  params: PitchParameters
): Vector3 {
  const speed = vec3.length(velocity)

  // 속도가 0이면 항력도 0
  if (speed === 0) return vec3.create(0, 0, 0)

  const velocityDirection = vec3.normalize(velocity)
  const area = Math.PI * params.radius * params.radius

  // F = -0.5 * ρ * C_d * A * v²
  const dragMagnitude = 0.5 * params.airDensity * params.dragCoefficient * area * speed * speed

  // 속도 반대 방향으로 작용
  return vec3.multiply(velocityDirection, -dragMagnitude)
}

/**
 * 마그누스 효과 계산 (Magnus Effect)
 * F_magnus = C_L * ρ * π * r³ * |v| * (ω × v̂)
 *
 * 공의 회전으로 인해 발생하는 양력
 *
 * @param velocity 속도 벡터 (m/s)
 * @param spinAxis 회전축 방향 벡터 (정규화된 단위 벡터)
 * @param params 물리 파라미터
 */
export function calculateMagnus(
  velocity: Vector3,
  spinAxis: Vector3,
  params: PitchParameters
): Vector3 {
  const speed = vec3.length(velocity)

  // 속도가 0이면 마그누스 효과도 0
  if (speed === 0) return vec3.create(0, 0, 0)

  // 회전이 없으면 마그누스 효과도 0
  if (params.spinRate === 0) return vec3.create(0, 0, 0)

  // rpm을 rad/s로 변환
  const spinRadPerSec = params.spinRate * (2 * Math.PI) / 60

  const velocityDirection = vec3.normalize(velocity)

  // ω × v̂ (회전축과 속도 방향의 외적)
  // spinAxis는 이미 정규화된 방향 벡터
  const forceDirection = vec3.cross(spinAxis, velocityDirection)

  // 마그누스 힘 계산
  // 표준 공식: F = C_L * ρ * π * r³ * |v| * |ω| * (ω̂ × v̂)
  // 여기서는 실용적 근사: F = 0.5 * C_L * ρ * A * v² * (r * ω / v) * (ω̂ × v̂)
  // 단순화: F = 0.5 * C_L * ρ * A * v * (r * ω) * (ω̂ × v̂)
  const area = Math.PI * params.radius * params.radius
  const magnusMagnitude =
    0.5 * params.liftCoefficient * params.airDensity * area * speed * (params.radius * spinRadPerSec)

  return vec3.multiply(forceDirection, magnusMagnitude)
}

/**
 * 모든 힘을 합산
 * F_total = F_gravity + F_drag + F_magnus
 */
export function calculateTotalForce(
  velocity: Vector3,
  spinAxis: Vector3,
  params: PitchParameters
): Vector3 {
  const gravity = calculateGravity(params.mass, params.gravity)
  const drag = calculateDrag(velocity, params)
  const magnus = calculateMagnus(velocity, spinAxis, params)

  return vec3.add(vec3.add(gravity, drag), magnus)
}

/**
 * 가속도 계산
 * a = F / m
 */
export function calculateAcceleration(
  force: Vector3,
  mass: number
): Vector3 {
  return vec3.divide(force, mass)
}
