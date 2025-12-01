import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      experiments: {
        Row: {
          id: string
          name: string
          params: unknown
          result: unknown
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          params: unknown
          result: unknown
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          params?: unknown
          result?: unknown
          created_at?: string
          updated_at?: string
        }
      }
      challenge_history: {
        Row: {
          id: string
          user_id: string
          challenge_type: 'target' | 'catcherMitt' | 'movement' | 'reverse'
          level_id: string
          level_title: string
          success: boolean
          attempts_used: number
          max_attempts: number
          score: number | null
          details: unknown
          parameters: unknown
          result: unknown
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_type: 'target' | 'catcherMitt' | 'movement' | 'reverse'
          level_id: string
          level_title: string
          success: boolean
          attempts_used: number
          max_attempts: number
          score?: number | null
          details?: unknown
          parameters?: unknown
          result?: unknown
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_type?: 'target' | 'catcherMitt' | 'movement' | 'reverse'
          level_id?: string
          level_title?: string
          success?: boolean
          attempts_used?: number
          max_attempts?: number
          score?: number | null
          details?: unknown
          parameters?: unknown
          result?: unknown
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      challenge_stats: {
        Row: {
          user_id: string
          challenge_type: 'target' | 'catcherMitt' | 'movement' | 'reverse'
          level_id: string
          level_title: string
          total_attempts: number
          total_successes: number
          success_rate: number
          best_score: number | null
          best_attempts: number | null
          last_success_at: string | null
        }
      }
    }
  }
}
