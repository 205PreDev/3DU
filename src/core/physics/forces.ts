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
 * F_magnus = 0.5 * C_L * ρ * A * |v|² * (ω × v̂)
 *
 * 공의 회전으로 인해 발생하는 양력
 *
 * @param velocity 속도 벡터 (m/s)
 * @param spin 회전 벡터 (rpm)
 * @param params 물리 파라미터
 */
export function calculateMagnus(
  velocity: Vector3,
  spin: Vector3,
  params: PitchParameters
): Vector3 {
  const speed = vec3.length(velocity)

  // 속도가 0이면 마그누스 효과도 0
  if (speed === 0) return vec3.create(0, 0, 0)

  // rpm을 rad/s로 변환
  const spinRadPerSec = vec3.multiply(spin, (2 * Math.PI) / 60)
  const spinMagnitude = vec3.length(spinRadPerSec)

  // 회전이 없으면 마그누스 효과도 0
  if (spinMagnitude === 0) return vec3.create(0, 0, 0)

  const velocityDirection = vec3.normalize(velocity)
  const spinDirection = vec3.normalize(spinRadPerSec)

  // ω × v̂ (회전축과 속도 방향의 외적)
  const crossProduct = vec3.cross(spinDirection, velocityDirection)

  const area = Math.PI * params.radius * params.radius

  // F = 0.5 * C_L * ρ * A * v² * |ω|
  // 실제로는 회전수에 따라 C_L이 변하지만, 여기서는 상수로 근사
  const magnusMagnitude =
    0.5 * params.liftCoefficient * params.airDensity * area * speed * speed * spinMagnitude

  return vec3.multiply(crossProduct, magnusMagnitude)
}

/**
 * 모든 힘을 합산
 * F_total = F_gravity + F_drag + F_magnus
 */
export function calculateTotalForce(
  velocity: Vector3,
  spin: Vector3,
  params: PitchParameters
): Vector3 {
  const gravity = calculateGravity(params.mass, params.gravity)
  const drag = calculateDrag(velocity, params)
  const magnus = calculateMagnus(velocity, spin, params)

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
