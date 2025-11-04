import { describe, test, expect } from '@jest/globals'
import {
  calculateAirDensity,
  calculateGravity,
  calculateDrag,
  calculateMagnus
} from './forces'
import { DEFAULT_BALL, DEFAULT_ENVIRONMENT } from '@/types'

describe('물리 계산 함수 테스트', () => {
  describe('calculateAirDensity', () => {
    test('표준 조건에서 공기 밀도 계산', () => {
      const rho = calculateAirDensity(20, 1013.25, 50)
      expect(rho).toBeCloseTo(1.199, 2) // 실제 계산값: 1.199 kg/m³
    })

    test('고온 조건에서 공기 밀도 감소', () => {
      const rho1 = calculateAirDensity(0, 1013.25, 50)
      const rho2 = calculateAirDensity(40, 1013.25, 50)
      expect(rho1).toBeGreaterThan(rho2)
    })

    test('고압 조건에서 공기 밀도 증가', () => {
      const rho1 = calculateAirDensity(20, 900, 50)
      const rho2 = calculateAirDensity(20, 1100, 50)
      expect(rho2).toBeGreaterThan(rho1)
    })

    test('고습도 조건에서 공기 밀도 감소', () => {
      const rho1 = calculateAirDensity(20, 1013.25, 10)
      const rho2 = calculateAirDensity(20, 1013.25, 90)
      expect(rho1).toBeGreaterThan(rho2)
    })
  })

  describe('calculateGravity', () => {
    test('표준 중력 계산', () => {
      const gravity = calculateGravity(0.145, 9.81)
      expect(gravity.x).toBe(0)
      expect(gravity.y).toBeCloseTo(-1.422, 3) // -0.145 * 9.81
      expect(gravity.z).toBe(0)
    })

    test('질량이 클수록 중력 증가', () => {
      const g1 = calculateGravity(0.1, 9.81)
      const g2 = calculateGravity(0.2, 9.81)
      expect(Math.abs(g2.y)).toBeGreaterThan(Math.abs(g1.y))
    })

    test('중력 가속도가 클수록 중력 증가', () => {
      const g1 = calculateGravity(0.145, 9.78)
      const g2 = calculateGravity(0.145, 9.83)
      expect(Math.abs(g2.y)).toBeGreaterThan(Math.abs(g1.y))
    })
  })

  describe('calculateDrag', () => {
    const params = {
      ball: DEFAULT_BALL,
      initial: {
        velocity: 40,
        angle: { horizontal: 0, vertical: -3 },
        spin: { x: 0, y: 0, z: 0 },
        releasePoint: { x: 0, y: 2, z: 0 }
      },
      environment: DEFAULT_ENVIRONMENT
    }

    test('속도가 0일 때 항력 0', () => {
      const drag = calculateDrag({ x: 0, y: 0, z: 0 }, params, 1.225)
      expect(drag.x).toBe(0)
      expect(drag.y).toBe(0)
      expect(drag.z).toBe(0)
    })

    test('항력은 속도 반대 방향', () => {
      const velocity = { x: 0, y: 0, z: -40 } // Z 음수 방향
      const drag = calculateDrag(velocity, params, 1.225)
      expect(drag.z).toBeGreaterThan(0) // 양수 방향 (속도 반대)
    })

    test('속도가 클수록 항력 증가 (제곱 비례)', () => {
      const drag1 = calculateDrag({ x: 0, y: 0, z: -20 }, params, 1.225)
      const drag2 = calculateDrag({ x: 0, y: 0, z: -40 }, params, 1.225)
      // 속도 2배 → 항력 4배
      expect(Math.abs(drag2.z)).toBeCloseTo(Math.abs(drag1.z) * 4, 0)
    })

    test('공기 밀도가 클수록 항력 증가', () => {
      const velocity = { x: 0, y: 0, z: -40 }
      const drag1 = calculateDrag(velocity, params, 1.0)
      const drag2 = calculateDrag(velocity, params, 1.5)
      expect(Math.abs(drag2.z)).toBeGreaterThan(Math.abs(drag1.z))
    })
  })

  describe('calculateMagnus', () => {
    const params = {
      ball: DEFAULT_BALL,
      initial: {
        velocity: 40,
        angle: { horizontal: 0, vertical: -3 },
        spin: { x: 0, y: 0, z: 0 },
        releasePoint: { x: 0, y: 2, z: 0 }
      },
      environment: DEFAULT_ENVIRONMENT
    }

    test('회전이 0일 때 마그누스 힘 0', () => {
      const velocity = { x: 0, y: 0, z: -40 }
      const spin = { x: 0, y: 0, z: 0 }
      const magnus = calculateMagnus(velocity, spin, params, 1.225)
      expect(magnus.x).toBeCloseTo(0, 5)
      expect(magnus.y).toBeCloseTo(0, 5)
      expect(magnus.z).toBeCloseTo(0, 5)
    })

    test('백스핀 시 양력 발생 (위쪽)', () => {
      const velocity = { x: 0, y: 0, z: -40 }
      const spin = { x: 2400, y: 0, z: 0 } // X축 회전 = 백스핀
      const magnus = calculateMagnus(velocity, spin, params, 1.225)
      expect(magnus.y).toBeGreaterThan(0) // 위쪽 힘
    })

    test('회전수가 클수록 마그누스 힘 증가', () => {
      const velocity = { x: 0, y: 0, z: -40 }
      const spin1 = { x: 1200, y: 0, z: 0 }
      const spin2 = { x: 2400, y: 0, z: 0 }
      const magnus1 = calculateMagnus(velocity, spin1, params, 1.225)
      const magnus2 = calculateMagnus(velocity, spin2, params, 1.225)
      expect(Math.abs(magnus2.y)).toBeGreaterThan(Math.abs(magnus1.y))
    })

    test('속도가 클수록 마그누스 힘 증가', () => {
      const velocity1 = { x: 0, y: 0, z: -30 }
      const velocity2 = { x: 0, y: 0, z: -45 }
      const spin = { x: 2400, y: 0, z: 0 }
      const magnus1 = calculateMagnus(velocity1, spin, params, 1.225)
      const magnus2 = calculateMagnus(velocity2, spin, params, 1.225)
      expect(Math.abs(magnus2.y)).toBeGreaterThan(Math.abs(magnus1.y))
    })
  })
})
