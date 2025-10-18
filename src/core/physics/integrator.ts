import { Vector3 } from '@/types'

// 벡터 유틸리티 함수들
export const vec3 = {
  create: (x = 0, y = 0, z = 0): Vector3 => ({ x, y, z }),

  clone: (v: Vector3): Vector3 => ({ x: v.x, y: v.y, z: v.z }),

  add: (a: Vector3, b: Vector3): Vector3 => ({
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  }),

  subtract: (a: Vector3, b: Vector3): Vector3 => ({
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  }),

  multiply: (v: Vector3, scalar: number): Vector3 => ({
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar
  }),

  divide: (v: Vector3, scalar: number): Vector3 => ({
    x: v.x / scalar,
    y: v.y / scalar,
    z: v.z / scalar
  }),

  dot: (a: Vector3, b: Vector3): number => {
    return a.x * b.x + a.y * b.y + a.z * b.z
  },

  cross: (a: Vector3, b: Vector3): Vector3 => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  }),

  length: (v: Vector3): number => {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
  },

  normalize: (v: Vector3): Vector3 => {
    const len = vec3.length(v)
    if (len === 0) return vec3.create(0, 0, 0)
    return vec3.divide(v, len)
  }
}

// Euler Method 적분기
export interface DerivativeFunction {
  (position: Vector3, velocity: Vector3, time: number): {
    velocityDerivative: Vector3
    accelerationDerivative: Vector3
  }
}

export interface IntegrationResult {
  position: Vector3
  velocity: Vector3
}

/**
 * Euler Method를 사용한 수치 적분
 * 단순하고 빠르지만 정확도는 낮음
 */
export function eulerIntegrate(
  position: Vector3,
  velocity: Vector3,
  time: number,
  dt: number,
  derivative: DerivativeFunction
): IntegrationResult {
  const { velocityDerivative, accelerationDerivative } = derivative(position, velocity, time)

  return {
    position: vec3.add(position, vec3.multiply(velocityDerivative, dt)),
    velocity: vec3.add(velocity, vec3.multiply(accelerationDerivative, dt))
  }
}

/**
 * Runge-Kutta 4차 (RK4) 적분
 * 정확도가 높지만 계산량이 많음
 * 향후 구현 예정
 */
export function rk4Integrate(
  position: Vector3,
  velocity: Vector3,
  time: number,
  dt: number,
  derivative: DerivativeFunction
): IntegrationResult {
  // k1
  const k1 = derivative(position, velocity, time)

  // k2
  const pos2 = vec3.add(position, vec3.multiply(k1.velocityDerivative, dt / 2))
  const vel2 = vec3.add(velocity, vec3.multiply(k1.accelerationDerivative, dt / 2))
  const k2 = derivative(pos2, vel2, time + dt / 2)

  // k3
  const pos3 = vec3.add(position, vec3.multiply(k2.velocityDerivative, dt / 2))
  const vel3 = vec3.add(velocity, vec3.multiply(k2.accelerationDerivative, dt / 2))
  const k3 = derivative(pos3, vel3, time + dt / 2)

  // k4
  const pos4 = vec3.add(position, vec3.multiply(k3.velocityDerivative, dt))
  const vel4 = vec3.add(velocity, vec3.multiply(k3.accelerationDerivative, dt))
  const k4 = derivative(pos4, vel4, time + dt)

  // 가중 평균
  const positionChange = vec3.multiply(
    vec3.add(
      vec3.add(k1.velocityDerivative, vec3.multiply(k2.velocityDerivative, 2)),
      vec3.add(vec3.multiply(k3.velocityDerivative, 2), k4.velocityDerivative)
    ),
    dt / 6
  )

  const velocityChange = vec3.multiply(
    vec3.add(
      vec3.add(k1.accelerationDerivative, vec3.multiply(k2.accelerationDerivative, 2)),
      vec3.add(vec3.multiply(k3.accelerationDerivative, 2), k4.accelerationDerivative)
    ),
    dt / 6
  )

  return {
    position: vec3.add(position, positionChange),
    velocity: vec3.add(velocity, velocityChange)
  }
}
