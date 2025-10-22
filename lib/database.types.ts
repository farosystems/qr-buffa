export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_user_id: string
          username: string
          email: string
          name: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          username: string
          email: string
          name: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          username?: string
          email?: string
          name?: string
          image_url?: string | null
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          status: 'por_atender' | 'pagado'
          qr_code: string
          created_at: string
          updated_at: string
          paid_by: string | null
          paid_at: string | null
        }
        Insert: {
          id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          status?: 'por_atender' | 'pagado'
          qr_code: string
          created_at?: string
          updated_at?: string
          paid_by?: string | null
          paid_at?: string | null
        }
        Update: {
          id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          status?: 'por_atender' | 'pagado'
          qr_code?: string
          created_at?: string
          updated_at?: string
          paid_by?: string | null
          paid_at?: string | null
        }
      }
      config: {
        Row: {
          id: string
          logo: string | null
          primary_color: string
          secondary_color: string
          company_name: string
          company_address: string | null
          company_phone: string | null
          access_password: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          logo?: string | null
          primary_color?: string
          secondary_color?: string
          company_name?: string
          company_address?: string | null
          company_phone?: string | null
          access_password: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          logo?: string | null
          primary_color?: string
          secondary_color?: string
          company_name?: string
          company_address?: string | null
          company_phone?: string | null
          access_password?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
