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
    }
  }
}
