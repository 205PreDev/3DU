import { PitchParameters, SimulationResult } from '@/types'

export interface RecentExperiment {
  id: string
  name: string
  params: PitchParameters
  result: SimulationResult
  createdAt: number
}

const STORAGE_KEY = 'recentExperiments'
const MAX_EXPERIMENTS = 10

/**
 * 최근 실험 데이터 관리 유틸리티
 * LocalStorage 기반, 최대 10개 저장
 */
export const recentExperimentsService = {
  /**
   * 모든 실험 가져오기 (최신순)
   */
  getAll(): RecentExperiment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []

      const experiments: RecentExperiment[] = JSON.parse(data)
      return experiments.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
      console.error('Failed to load recent experiments:', error)
      return []
    }
  },

  /**
   * 실험 저장
   * @param name 실험 이름
   * @param params 파라미터
   * @param result 결과
   */
  save(name: string, params: PitchParameters, result: SimulationResult): RecentExperiment {
    try {
      const experiments = this.getAll()

      const newExperiment: RecentExperiment = {
        id: crypto.randomUUID(),
        name: name || `실험 ${new Date().toLocaleString('ko-KR')}`,
        params,
        result,
        createdAt: Date.now()
      }

      // 최대 개수 제한 (오래된 것 제거)
      const updatedExperiments = [newExperiment, ...experiments].slice(0, MAX_EXPERIMENTS)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExperiments))
      return newExperiment
    } catch (error) {
      console.error('Failed to save experiment:', error)
      throw error
    }
  },

  /**
   * 특정 실험 가져오기
   */
  getById(id: string): RecentExperiment | null {
    const experiments = this.getAll()
    return experiments.find(exp => exp.id === id) || null
  },

  /**
   * 실험 삭제
   */
  delete(id: string): void {
    try {
      const experiments = this.getAll()
      const filtered = experiments.filter(exp => exp.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to delete experiment:', error)
      throw error
    }
  },

  /**
   * 모든 실험 삭제
   */
  deleteAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to delete all experiments:', error)
      throw error
    }
  },

  /**
   * 실험 개수
   */
  count(): number {
    return this.getAll().length
  }
}
