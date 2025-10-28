import { PitchParameters, SimulationResult } from '@/types'
import { supabase } from '@/lib/supabase'

export interface SupabaseExperiment {
  id: string
  name: string
  params: PitchParameters
  result: SimulationResult
  created_at: string
  updated_at: string
}

/**
 * Supabase 기반 실험 데이터 관리 서비스
 * 클라우드 데이터베이스에 실험 저장/불러오기
 */
export const supabaseExperimentsService = {
  /**
   * 모든 실험 가져오기 (최신순)
   * @param limit 최대 개수 (기본값: 10)
   */
  async getAll(limit = 10): Promise<SupabaseExperiment[]> {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map(exp => ({
        id: exp.id,
        name: exp.name,
        params: exp.params as PitchParameters,
        result: exp.result as SimulationResult,
        created_at: exp.created_at,
        updated_at: exp.updated_at
      }))
    } catch (error) {
      console.error('Failed to load experiments from Supabase:', error)
      return []
    }
  },

  /**
   * 실험 저장
   * @param name 실험 이름
   * @param params 파라미터
   * @param result 결과
   */
  async save(
    name: string,
    params: PitchParameters,
    result: SimulationResult
  ): Promise<SupabaseExperiment | null> {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .insert({
          name: name || `실험 ${new Date().toLocaleString('ko-KR')}`,
          params: params as unknown,
          result: result as unknown
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        params: data.params as PitchParameters,
        result: data.result as SimulationResult,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    } catch (error) {
      console.error('Failed to save experiment to Supabase:', error)
      return null
    }
  },

  /**
   * 특정 실험 가져오기
   */
  async getById(id: string): Promise<SupabaseExperiment | null> {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        params: data.params as PitchParameters,
        result: data.result as SimulationResult,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    } catch (error) {
      console.error('Failed to get experiment from Supabase:', error)
      return null
    }
  },

  /**
   * 실험 삭제
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('experiments')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to delete experiment from Supabase:', error)
      return false
    }
  },

  /**
   * 모든 실험 삭제
   */
  async deleteAll(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('experiments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 행 삭제

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to delete all experiments from Supabase:', error)
      return false
    }
  },

  /**
   * 실험 개수
   */
  async count(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('experiments')
        .select('*', { count: 'exact', head: true })

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Failed to count experiments from Supabase:', error)
      return 0
    }
  }
}
