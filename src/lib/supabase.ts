import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'creator' | 'founder'
          store_name?: string
          phone?: string
          avatar_url?: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'creator' | 'founder'
          store_name?: string
          phone?: string
          avatar_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'creator' | 'founder'
          store_name?: string
          phone?: string
          avatar_url?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          price: number
          description: string
          image_url: string
          stock: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          price: number
          description: string
          image_url: string
          stock: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          price?: number
          description?: string
          image_url?: string
          stock?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          product_id: string
          user_id: string
          buyer_name: string
          buyer_email: string
          buyer_phone: string
          notes?: string
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          buyer_name: string
          buyer_email: string
          buyer_phone: string
          notes?: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          buyer_name?: string
          buyer_email?: string
          buyer_phone?: string
          notes?: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Record<string, any>
          created_at?: string
        }
      }
    }
  }
}
