import { supabase } from './supabase'
import type { PitchParameters, SimulationResult } from '../types'
import type { ChallengeType } from '../contexts/ChallengeContext'

// ==================== Types ====================

export interface ExperimentData {
  id: string
  user_id: string
  scenario: string
  name: string
  data: {
    params: PitchParameters
    result: SimulationResult
  }
  created_at: string
  updated_at: string
}

export interface ChallengeHistoryData {
  id: string
  user_id: string
  challenge_type: ChallengeType
  level_id: string
  level_title: string
  success: boolean
  attempts_used: number
  max_attempts: number
  score: number | null
  details?: unknown
  parameters?: PitchParameters
  result?: SimulationResult
  created_at: string
  updated_at: string
}

export interface ChallengeStats {
  user_id: string
  challenge_type: ChallengeType
  level_id: string
  level_title: string
  total_attempts: number
  total_successes: number
  success_rate: number
  best_score: number | null
  best_attempts: number | null
  last_success_at: string | null
}

// ⚠️ DEPRECATED: 미니게임 기능 보류 (2025-11-05)
// export interface MinigameScore {
//   id: string
//   user_id: string
//   game_type: string
//   score: {
//     value: number
//     rank: string
//     attempts: number
//     metadata?: Record<string, any>
//   }
//   created_at: string
// }

// ==================== Experiments API ====================

export const experimentsApi = {
  /**
   * 실험 목록 가져오기 (최근 순)
   */
  async list(limit = 10): Promise<ExperimentData[]> {
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * 특정 실험 가져오기
   */
  async get(id: string): Promise<ExperimentData | null> {
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * 실험 저장
   */
  async create(name: string, params: PitchParameters, result: SimulationResult): Promise<ExperimentData> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('로그인이 필요합니다.')

    const { data, error } = await supabase
      .from('experiments')
      .insert({
        user_id: userData.user.id,
        scenario: 'pitch',
        name,
        data: { params, result },
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 실험 삭제
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('experiments')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * 여러 실험 가져오기 (비교 모드용)
   */
  async getMany(ids: string[]): Promise<ExperimentData[]> {
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .in('id', ids)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },
}

// ==================== Minigame Scores API (DEPRECATED) ====================
// ⚠️ 미니게임 및 리더보드 기능 보류 (2025-11-05)
// 향후 필요 시 재활성화 가능

// export const minigameApi = {
//   /**
//    * 미니게임 기록 저장
//    */
//   async create(
//     gameType: string,
//     score: { value: number; rank: string; attempts: number; metadata?: Record<string, any> }
//   ): Promise<MinigameScore> {
//     const { data: userData } = await supabase.auth.getUser()
//     if (!userData.user) throw new Error('로그인이 필요합니다.')

//     const { data, error } = await supabase
//       .from('minigame_scores')
//       .insert({
//         user_id: userData.user.id,
//         game_type: gameType,
//         score,
//       })
//       .select()
//       .single()

//     if (error) throw error
//     return data
//   },

//   /**
//    * 리더보드 가져오기
//    */
//   async leaderboard(gameType: string, limit = 10) {
//     const { data, error } = await supabase
//       .from('minigame_scores')
//       .select(`
//         id,
//         score,
//         created_at,
//         profiles (username)
//       `)
//       .eq('game_type', gameType)
//       .order('score->value', { ascending: false })
//       .limit(limit)

//     if (error) throw error
//     return data || []
//   },

//   /**
//    * 내 기록 가져오기
//    */
//   async myScores(gameType: string, limit = 10): Promise<MinigameScore[]> {
//     const { data, error } = await supabase
//       .from('minigame_scores')
//       .select('*')
//       .eq('game_type', gameType)
//       .order('created_at', { ascending: false })
//       .limit(limit)

//     if (error) throw error
//     return data || []
//   },
// }

// ==================== LocalStorage Migration ====================

interface LocalExperiment {
  id: string
  name: string
  params: PitchParameters
  result: SimulationResult
  createdAt: number
}

export async function migrateLocalExperiments(): Promise<void> {
  const localData = localStorage.getItem('recentExperiments')
  if (!localData) return

  const localExperiments: LocalExperiment[] = JSON.parse(localData)
  if (localExperiments.length === 0) return

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    console.warn('로그인하지 않아 마이그레이션을 건너뜁니다.')
    return
  }

  try {
    const { error } = await supabase.from('experiments').insert(
      localExperiments.map((exp) => ({
        user_id: userData.user.id,
        scenario: 'pitch',
        name: exp.name,
        data: { params: exp.params, result: exp.result },
      }))
    )

    if (error) throw error

    // 백업 후 삭제
    localStorage.setItem('recentExperiments_backup', localData)
    localStorage.removeItem('recentExperiments')
    // 프로덕션: 마이그레이션 로그 제거
  } catch (error) {
    console.error('마이그레이션 실패:', error)
    throw error
  }
}

// ==================== Challenge History API ====================

export const challengeHistoryApi = {
  /**
   * 챌린지 기록 저장
   */
  async create(data: {
    challenge_type: ChallengeType
    level_id: string
    level_title: string
    success: boolean
    attempts_used: number
    max_attempts: number
    score?: number
    details?: unknown
    parameters?: PitchParameters
    result?: SimulationResult
  }): Promise<ChallengeHistoryData> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('로그인이 필요합니다.')

    const { data: record, error } = await supabase
      .from('challenge_history')
      .insert({
        user_id: userData.user.id,
        ...data,
      })
      .select()
      .single()

    if (error) throw error
    return record
  },

  /**
   * 특정 챌린지 타입의 기록 가져오기
   */
  async listByType(
    challengeType: ChallengeType,
    limit = 20
  ): Promise<ChallengeHistoryData[]> {
    const { data, error } = await supabase
      .from('challenge_history')
      .select('*')
      .eq('challenge_type', challengeType)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * 특정 레벨의 기록 가져오기
   */
  async listByLevel(
    challengeType: ChallengeType,
    levelId: string,
    limit = 10
  ): Promise<ChallengeHistoryData[]> {
    const { data, error } = await supabase
      .from('challenge_history')
      .select('*')
      .eq('challenge_type', challengeType)
      .eq('level_id', levelId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * 챌린지 통계 가져오기
   */
  async getStats(
    challengeType?: ChallengeType
  ): Promise<ChallengeStats[]> {
    let query = supabase
      .from('challenge_stats')
      .select('*')

    if (challengeType) {
      query = query.eq('challenge_type', challengeType)
    }

    const { data, error } = await query.order('success_rate', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * 특정 레벨의 통계 가져오기
   */
  async getLevelStats(
    challengeType: ChallengeType,
    levelId: string
  ): Promise<ChallengeStats | null> {
    const { data, error } = await supabase
      .from('challenge_stats')
      .select('*')
      .eq('challenge_type', challengeType)
      .eq('level_id', levelId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }
    return data
  },

  /**
   * 최근 성공한 챌린지 가져오기
   */
  async getRecentSuccesses(limit = 5): Promise<ChallengeHistoryData[]> {
    const { data, error } = await supabase
      .from('challenge_history')
      .select('*')
      .eq('success', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * 챌린지 기록 삭제
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('challenge_history')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
