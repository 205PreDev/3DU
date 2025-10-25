import { Vector3, PitchParameters, EnvironmentConditions } from '@/types'
import { vec3 } from './integrator'

/**
 * v2: 공기 밀도 계산 (이상 기체 법칙 기반)
 * ρ = p / (R_specific * T)
 *
 * @param temp 온도 (°C)
 * @param pressure 기압 (hPa)
 * @param humidity 상대 습도 (%)
 * @returns 공기 밀도 (kg/m³)
 */
export function calculateAirDensity(
  temp: number,
  pressure: number,
  humidity: number
): number {
  // 온도를 켈빈으로 변환
  const T = temp + 273.15

  // 기압을 Pa로 변환 (1 hPa = 100 Pa)
  const p = pressure * 100

  // 건조 공기 기체 상수 (J/(kg·K))
  const R_specific = 287.05

  // 포화 수증기압 (Pa) - Magnus formula
  const e_s = 611.2 * Math.exp(17.67 * temp / (temp + 243.5))

  // 실제 수증기압 (Pa)
  const e = (humidity / 100) * e_s

  // 건조 공기 분압 (Pa)
  const p_d = p - e

  // 공기 밀도 계산 (습도 고려)
  // ρ = p_d / (R_d * T) + e / (R_v * T)
  // 간소화: ρ ≈ p / (R_specific * T) * (1 - 0.378 * e / p)
  const rho = (p / (R_specific * T)) * (1 - 0.378 * e / p)

  return rho
}

/**
 * 중력 계산
 * F = m * g * [0, -1, 0]
 */
export function calculateGravity(mass: number, gravity: number): Vector3 {
  return vec3.create(0, -mass * gravity, 0)
}

/**
 * v2: 항력 계산 (Drag Force)
 * F_drag = -0.5 * ρ * C_d * A * |v|² * v̂
 *
 * @param velocity 속도 벡터 (m/s)
 * @param params 물리 파라미터
 * @param airDensity 공기 밀도 (kg/m³)
 */
export function calculateDrag(
  velocity: Vector3,
  params: PitchParameters,
  airDensity: number
): Vector3 {
  const speed = vec3.length(velocity)

  // 속도가 0이면 항력도 0
  if (speed === 0) return vec3.create(0, 0, 0)

  const velocityDirection = vec3.normalize(velocity)
  const area = Math.PI * params.ball.radius * params.ball.radius

  // F = -0.5 * ρ * C_d * A * v²
  const dragMagnitude = 0.5 * airDensity * params.ball.dragCoefficient * area * speed * speed

  // 속도 반대 방향으로 작용
  return vec3.multiply(velocityDirection, -dragMagnitude)
}

/**
 * v2: 마그누스 효과 계산 (Magnus Effect)
 * F_magnus = C_L * ρ * π * r³ * |v| * (ω × v̂)
 *
 * 공의 회전으로 인해 발생하는 양력
 *
 * @param velocity 속도 벡터 (m/s)
 * @param spin 회전 벡터 (rpm, x/y/z)
 * @param params 물리 파라미터
 * @param airDensity 공기 밀도 (kg/m³)
 */
export function calculateMagnus(
  velocity: Vector3,
  spin: Vector3,
  params: PitchParameters,
  airDensity: number
): Vector3 {
  const speed = vec3.length(velocity)

  // 속도가 0이면 마그누스 효과도 0
  if (speed === 0) return vec3.create(0, 0, 0)

  // 회전이 없으면 마그누스 효과도 0
  const spinMagnitude = vec3.length(spin)
  if (spinMagnitude === 0) return vec3.create(0, 0, 0)

  // rpm을 rad/s로 변환
  const spinRadPerSec = spinMagnitude * (2 * Math.PI) / 60

  // 회전축 방향 (정규화)
  const spinAxis = vec3.normalize(spin)

  const velocityDirection = vec3.normalize(velocity)

  // ω × v̂ (회전축과 속도 방향의 외적)
  const forceDirection = vec3.cross(spinAxis, velocityDirection)

  // 마그누스 힘 계산
  const area = Math.PI * params.ball.radius * params.ball.radius
  const magnusMagnitude =
    0.5 * params.ball.liftCoefficient * airDensity * area * speed * (params.ball.radius * spinRadPerSec)

  return vec3.multiply(forceDirection, magnusMagnitude)
}

/**
 * v2: 모든 힘을 합산
 * F_total = F_gravity + F_drag + F_magnus
 */
export function calculateTotalForce(
  velocity: Vector3,
  spin: Vector3,
  params: PitchParameters
): Vector3 {
  // 환경 변수에서 공기 밀도 계산
  const airDensity = calculateAirDensity(
    params.environment.temperature,
    params.environment.pressure,
    params.environment.humidity
  )

  const gravity = calculateGravity(params.ball.mass, params.environment.gravity)
  const drag = calculateDrag(velocity, params, airDensity)
  const magnus = calculateMagnus(velocity, spin, params, airDensity)

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
