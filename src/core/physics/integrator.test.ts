import { describe, test, expect } from '@jest/globals'
import { vec3 } from './integrator'

describe('Vector3 유틸리티 함수 테스트', () => {
  describe('vec3.create', () => {
    test('벡터 생성', () => {
      const v = vec3.create(1, 2, 3)
      expect(v).toEqual({ x: 1, y: 2, z: 3 })
    })
  })

  describe('vec3.add', () => {
    test('벡터 덧셈', () => {
      const v1 = { x: 1, y: 2, z: 3 }
      const v2 = { x: 4, y: 5, z: 6 }
      const result = vec3.add(v1, v2)
      expect(result).toEqual({ x: 5, y: 7, z: 9 })
    })
  })

  describe('vec3.subtract', () => {
    test('벡터 뺄셈', () => {
      const v1 = { x: 5, y: 7, z: 9 }
      const v2 = { x: 1, y: 2, z: 3 }
      const result = vec3.subtract(v1, v2)
      expect(result).toEqual({ x: 4, y: 5, z: 6 })
    })
  })

  describe('vec3.multiply', () => {
    test('벡터 스칼라 곱셈', () => {
      const v = { x: 1, y: 2, z: 3 }
      const result = vec3.multiply(v, 3)
      expect(result).toEqual({ x: 3, y: 6, z: 9 })
    })

    test('0 곱셈', () => {
      const v = { x: 5, y: 10, z: 15 }
      const result = vec3.multiply(v, 0)
      expect(result).toEqual({ x: 0, y: 0, z: 0 })
    })
  })

  describe('vec3.length', () => {
    test('벡터 크기 계산', () => {
      const v = { x: 3, y: 4, z: 0 }
      const length = vec3.length(v)
      expect(length).toBe(5) // 3-4-5 직각삼각형
    })

    test('영벡터 크기는 0', () => {
      const v = { x: 0, y: 0, z: 0 }
      const length = vec3.length(v)
      expect(length).toBe(0)
    })

    test('3D 벡터 크기 계산', () => {
      const v = { x: 1, y: 2, z: 2 }
      const length = vec3.length(v)
      expect(length).toBe(3) // √(1² + 2² + 2²) = √9 = 3
    })
  })

  describe('vec3.normalize', () => {
    test('벡터 정규화 (크기 1)', () => {
      const v = { x: 3, y: 4, z: 0 }
      const normalized = vec3.normalize(v)
      expect(normalized.x).toBeCloseTo(0.6, 5)
      expect(normalized.y).toBeCloseTo(0.8, 5)
      expect(normalized.z).toBe(0)
      expect(vec3.length(normalized)).toBeCloseTo(1, 5)
    })

    test('이미 정규화된 벡터', () => {
      const v = { x: 1, y: 0, z: 0 }
      const normalized = vec3.normalize(v)
      expect(normalized).toEqual({ x: 1, y: 0, z: 0 })
    })

    test('영벡터 정규화는 영벡터 반환', () => {
      const v = { x: 0, y: 0, z: 0 }
      const normalized = vec3.normalize(v)
      expect(normalized).toEqual({ x: 0, y: 0, z: 0 })
    })
  })

  describe('vec3.dot', () => {
    test('내적 계산', () => {
      const v1 = { x: 1, y: 2, z: 3 }
      const v2 = { x: 4, y: 5, z: 6 }
      const dot = vec3.dot(v1, v2)
      expect(dot).toBe(32) // 1*4 + 2*5 + 3*6
    })

    test('수직 벡터의 내적은 0', () => {
      const v1 = { x: 1, y: 0, z: 0 }
      const v2 = { x: 0, y: 1, z: 0 }
      const dot = vec3.dot(v1, v2)
      expect(dot).toBe(0)
    })
  })

  describe('vec3.cross', () => {
    test('외적 계산', () => {
      const v1 = { x: 1, y: 0, z: 0 }
      const v2 = { x: 0, y: 1, z: 0 }
      const cross = vec3.cross(v1, v2)
      expect(cross).toEqual({ x: 0, y: 0, z: 1 })
    })

    test('평행 벡터의 외적은 영벡터', () => {
      const v1 = { x: 2, y: 4, z: 6 }
      const v2 = { x: 1, y: 2, z: 3 }
      const cross = vec3.cross(v1, v2)
      expect(cross.x).toBeCloseTo(0, 5)
      expect(cross.y).toBeCloseTo(0, 5)
      expect(cross.z).toBeCloseTo(0, 5)
    })

    test('외적은 두 벡터에 수직', () => {
      const v1 = { x: 1, y: 2, z: 3 }
      const v2 = { x: 4, y: 5, z: 6 }
      const cross = vec3.cross(v1, v2)

      // cross · v1 = 0
      expect(vec3.dot(cross, v1)).toBeCloseTo(0, 5)
      // cross · v2 = 0
      expect(vec3.dot(cross, v2)).toBeCloseTo(0, 5)
    })
  })
})
