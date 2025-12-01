import type { PitchParameters, SimulationResult } from '@/types'
import { runSimulation } from '@/core/physics/simulator'
import { analyzeSensitivity } from './sensitivityAnalysis'

/**
 * 역운동학(Inverse Kinematics) 솔버
 * Gradient Descent + Genetic Algorithm 하이브리드 접근
 */

export interface IKTarget {
  plateHeight?: number // 목표 홈플레이트 높이 (m)
  finalPositionX?: number // 목표 X 위치 (m)
  horizontalBreak?: number // 목표 수평 변화량 (m)
  verticalDrop?: number // 목표 수직 낙차 (m)
}

export interface IKSolution {
  params: PitchParameters
  result: SimulationResult
  error: number // 목표와의 오차
  fitness: number // 적합도 (0-1, 1이 최적)
}

export interface IKSolverResult {
  solutions: IKSolution[]
  bestSolution: IKSolution
  iterations: number
  converged: boolean
  method: 'gradient_descent' | 'genetic_algorithm' | 'hybrid'
}

/**
 * 목표와 결과 간의 오차 계산
 */
function calculateError(result: SimulationResult, target: IKTarget): number {
  let error = 0
  let count = 0

  if (target.plateHeight !== undefined) {
    error += Math.pow(result.plateHeight - target.plateHeight, 2)
    count++
  }

  if (target.finalPositionX !== undefined) {
    error += Math.pow(result.finalPosition.x - target.finalPositionX, 2)
    count++
  }

  if (target.horizontalBreak !== undefined) {
    error += Math.pow(result.horizontalBreak - target.horizontalBreak, 2)
    count++
  }

  if (target.verticalDrop !== undefined) {
    error += Math.pow(result.verticalDrop - target.verticalDrop, 2)
    count++
  }

  return count > 0 ? Math.sqrt(error / count) : 0
}

/**
 * Gradient Descent를 사용한 IK 솔버
 */
export function solveWithGradientDescent(
  initialParams: PitchParameters,
  target: IKTarget,
  options: {
    maxIterations?: number
    learningRate?: number
    tolerance?: number
  } = {}
): IKSolverResult {
  const maxIterations = options.maxIterations ?? 50
  const learningRate = options.learningRate ?? 0.1
  const tolerance = options.tolerance ?? 0.01

  let currentParams = { ...initialParams }
  let bestParams = currentParams
  let bestError = Infinity
  let iterations = 0

  const solutions: IKSolution[] = []

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations++

    // 현재 파라미터로 시뮬레이션
    const currentResult = runSimulation(currentParams)
    const currentError = calculateError(currentResult, target)

    // 최적 솔루션 업데이트
    if (currentError < bestError) {
      bestError = currentError
      bestParams = { ...currentParams }
    }

    // 솔루션 저장
    solutions.push({
      params: currentParams,
      result: currentResult,
      error: currentError,
      fitness: 1 / (1 + currentError)
    })

    // 수렴 체크
    if (currentError < tolerance) {
      break
    }

    // 민감도 분석으로 gradient 계산
    const sensitivity = analyzeSensitivity(currentParams, 0.01)

    // 각 파라미터를 gradient 방향으로 업데이트
    const newParams = { ...currentParams }

    // 속도 조정
    if (target.plateHeight !== undefined || target.verticalDrop !== undefined) {
      const velocitySens = sensitivity.sensitivities.find(s => s.parameter === 'velocity')
      if (velocitySens) {
        const gradient = target.plateHeight !== undefined
          ? velocitySens.plateHeightSensitivity
          : -velocitySens.verticalDropSensitivity

        const targetValue = target.plateHeight ?? (currentResult.verticalDrop - (target.verticalDrop ?? 0))
        const currentValue = target.plateHeight !== undefined
          ? currentResult.plateHeight
          : currentResult.verticalDrop

        const delta = (targetValue - currentValue) * learningRate / Math.abs(gradient + 0.001)
        newParams.initial.velocity = Math.max(10, Math.min(50, currentParams.initial.velocity + delta))
      }
    }

    // 수평각 조정
    if (target.finalPositionX !== undefined || target.horizontalBreak !== undefined) {
      const angleSens = sensitivity.sensitivities.find(s => s.parameter === 'horizontalAngle')
      if (angleSens) {
        const gradient = target.finalPositionX !== undefined
          ? angleSens.finalPositionXSensitivity
          : angleSens.horizontalBreakSensitivity

        const targetValue = target.finalPositionX ?? target.horizontalBreak ?? 0
        const currentValue = target.finalPositionX !== undefined
          ? currentResult.finalPosition.x
          : currentResult.horizontalBreak

        const delta = (targetValue - currentValue) * learningRate / Math.abs(gradient + 0.001)
        newParams.initial.angle.horizontal = Math.max(-10, Math.min(10, currentParams.initial.angle.horizontal + delta))
      }
    }

    // 수직각 조정
    if (target.plateHeight !== undefined) {
      const angleSens = sensitivity.sensitivities.find(s => s.parameter === 'verticalAngle')
      if (angleSens) {
        const gradient = angleSens.plateHeightSensitivity
        const delta = (target.plateHeight - currentResult.plateHeight) * learningRate / Math.abs(gradient + 0.001)
        newParams.initial.angle.vertical = Math.max(-10, Math.min(10, currentParams.initial.angle.vertical + delta))
      }
    }

    currentParams = newParams
  }

  const bestResult = runSimulation(bestParams)
  const bestSolution: IKSolution = {
    params: bestParams,
    result: bestResult,
    error: bestError,
    fitness: 1 / (1 + bestError)
  }

  return {
    solutions,
    bestSolution,
    iterations,
    converged: bestError < tolerance,
    method: 'gradient_descent'
  }
}

/**
 * Genetic Algorithm을 사용한 IK 솔버
 */
export function solveWithGeneticAlgorithm(
  initialParams: PitchParameters,
  target: IKTarget,
  options: {
    populationSize?: number
    generations?: number
    mutationRate?: number
    tolerance?: number
  } = {}
): IKSolverResult {
  const populationSize = options.populationSize ?? 20
  const generations = options.generations ?? 30
  const mutationRate = options.mutationRate ?? 0.1
  const tolerance = options.tolerance ?? 0.01

  // 초기 개체군 생성
  let population: IKSolution[] = []

  for (let i = 0; i < populationSize; i++) {
    const params = i === 0 ? initialParams : mutateParams(initialParams, 0.3)
    const result = runSimulation(params)
    const error = calculateError(result, target)

    population.push({
      params,
      result,
      error,
      fitness: 1 / (1 + error)
    })
  }

  const allSolutions: IKSolution[] = [...population]
  let iterations = 0

  for (let gen = 0; gen < generations; gen++) {
    iterations++

    // 적합도로 정렬
    population.sort((a, b) => b.fitness - a.fitness)

    // 최적 솔루션 체크
    if (population[0].error < tolerance) {
      break
    }

    // 새 세대 생성
    const newPopulation: IKSolution[] = []

    // 엘리트 보존 (상위 20%)
    const eliteCount = Math.floor(populationSize * 0.2)
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push(population[i])
    }

    // 교차 및 돌연변이로 나머지 채우기
    while (newPopulation.length < populationSize) {
      // 토너먼트 선택으로 부모 선택
      const parent1 = tournamentSelection(population, 3)
      const parent2 = tournamentSelection(population, 3)

      // 교차
      let childParams = crossover(parent1.params, parent2.params)

      // 돌연변이
      if (Math.random() < mutationRate) {
        childParams = mutateParams(childParams, 0.1)
      }

      const result = runSimulation(childParams)
      const error = calculateError(result, target)

      newPopulation.push({
        params: childParams,
        result,
        error,
        fitness: 1 / (1 + error)
      })
    }

    population = newPopulation
    allSolutions.push(...population)
  }

  // 최적 솔루션 찾기
  population.sort((a, b) => b.fitness - a.fitness)
  const bestSolution = population[0]

  // 다양한 솔루션 반환 (상위 5개)
  const uniqueSolutions = population.slice(0, 5)

  return {
    solutions: uniqueSolutions,
    bestSolution,
    iterations,
    converged: bestSolution.error < tolerance,
    method: 'genetic_algorithm'
  }
}

/**
 * Hybrid 솔버: Gradient Descent로 빠르게 접근 후 Genetic Algorithm로 다양한 해 탐색
 */
export function solveIK(
  initialParams: PitchParameters,
  target: IKTarget
): IKSolverResult {
  // 1단계: Gradient Descent로 빠른 수렴
  const gdResult = solveWithGradientDescent(initialParams, target, {
    maxIterations: 30,
    learningRate: 0.15,
    tolerance: 0.01
  })

  // 2단계: GD 결과를 시작점으로 GA 실행 (다양한 솔루션 탐색)
  const gaResult = solveWithGeneticAlgorithm(gdResult.bestSolution.params, target, {
    populationSize: 15,
    generations: 20,
    mutationRate: 0.15,
    tolerance: 0.01
  })

  // 두 방법의 결과 합치기
  const allSolutions = [...gdResult.solutions, ...gaResult.solutions]
    .sort((a, b) => a.error - b.error)

  // 중복 제거 및 상위 5개 선택
  const uniqueSolutions: IKSolution[] = []
  for (const sol of allSolutions) {
    if (uniqueSolutions.length >= 5) break

    // 비슷한 솔루션 체크
    const isDuplicate = uniqueSolutions.some(existing =>
      Math.abs(existing.params.initial.velocity - sol.params.initial.velocity) < 0.5 &&
      Math.abs(existing.params.initial.angle.horizontal - sol.params.initial.angle.horizontal) < 0.5 &&
      Math.abs(existing.params.initial.angle.vertical - sol.params.initial.angle.vertical) < 0.5
    )

    if (!isDuplicate) {
      uniqueSolutions.push(sol)
    }
  }

  return {
    solutions: uniqueSolutions,
    bestSolution: uniqueSolutions[0] || gaResult.bestSolution,
    iterations: gdResult.iterations + gaResult.iterations,
    converged: uniqueSolutions[0]?.error < 0.01,
    method: 'hybrid'
  }
}

// === 유틸리티 함수들 ===

function mutateParams(params: PitchParameters, strength: number): PitchParameters {
  const mutated = JSON.parse(JSON.stringify(params)) as PitchParameters

  // 속도 돌연변이
  mutated.initial.velocity += (Math.random() - 0.5) * 10 * strength
  mutated.initial.velocity = Math.max(10, Math.min(50, mutated.initial.velocity))

  // 각도 돌연변이
  mutated.initial.angle.horizontal += (Math.random() - 0.5) * 10 * strength
  mutated.initial.angle.horizontal = Math.max(-10, Math.min(10, mutated.initial.angle.horizontal))

  mutated.initial.angle.vertical += (Math.random() - 0.5) * 10 * strength
  mutated.initial.angle.vertical = Math.max(-10, Math.min(10, mutated.initial.angle.vertical))

  // 회전 돌연변이
  mutated.initial.spin.x += (Math.random() - 0.5) * 1000 * strength
  mutated.initial.spin.y += (Math.random() - 0.5) * 1000 * strength
  mutated.initial.spin.z += (Math.random() - 0.5) * 500 * strength

  return mutated
}

function crossover(parent1: PitchParameters, parent2: PitchParameters): PitchParameters {
  const child = JSON.parse(JSON.stringify(parent1)) as PitchParameters

  // 50% 확률로 각 유전자를 parent2에서 가져오기
  if (Math.random() < 0.5) {
    child.initial.velocity = parent2.initial.velocity
  }

  if (Math.random() < 0.5) {
    child.initial.angle = { ...parent2.initial.angle }
  }

  if (Math.random() < 0.5) {
    child.initial.spin = { ...parent2.initial.spin }
  }

  return child
}

function tournamentSelection(population: IKSolution[], tournamentSize: number): IKSolution {
  let best = population[Math.floor(Math.random() * population.length)]

  for (let i = 1; i < tournamentSize; i++) {
    const competitor = population[Math.floor(Math.random() * population.length)]
    if (competitor.fitness > best.fitness) {
      best = competitor
    }
  }

  return best
}
