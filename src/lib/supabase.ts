import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'creator' | 'founder'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'creator' | 'founder'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'creator' | 'founder'
          created_at?: string
        }
      }
      creators: {
        Row: {
          id: string
          user_id: string
          store_name: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          store_name: string
          phone: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          store_name?: string
          phone?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          creator_id: string
          name: string
          price: number
          description: string
          image_url: string
          stock: number
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          name: string
          price: number
          description: string
          image_url: string
          stock: number
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          price?: number
          description?: string
          image_url?: string
          stock?: number
          created_at?: string
        }
      }
    }
  }
}
