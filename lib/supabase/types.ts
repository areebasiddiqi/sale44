export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          stripe_customer_id: string | null
          plan: 'free' | 'starter' | 'growth' | 'pro'
          free_signup_month: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          stripe_customer_id?: string | null
          plan?: 'free' | 'starter' | 'growth' | 'pro'
          free_signup_month?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          stripe_customer_id?: string | null
          plan?: 'free' | 'starter' | 'growth' | 'pro'
          free_signup_month?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audits: {
        Row: {
          id: string
          user_id: string
          business_url: string
          business_name: string | null
          total_score: number | null
          parameter_scores: Record<string, any>
          report_data: Record<string, any>
          watermarked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_url: string
          business_name?: string | null
          total_score?: number | null
          parameter_scores?: Record<string, any>
          report_data?: Record<string, any>
          watermarked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_url?: string
          business_name?: string | null
          total_score?: number | null
          parameter_scores?: Record<string, any>
          report_data?: Record<string, any>
          watermarked?: boolean
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          audit_id: string
          user_id: string
          company_name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          verified_status: {
            accuracy: boolean
            deliverability: boolean
            relevance: boolean
            compliance: boolean
          }
          created_at: string
        }
        Insert: {
          id?: string
          audit_id: string
          user_id: string
          company_name: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          verified_status?: {
            accuracy: boolean
            deliverability: boolean
            relevance: boolean
            compliance: boolean
          }
          created_at?: string
        }
        Update: {
          id?: string
          audit_id?: string
          user_id?: string
          company_name?: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          verified_status?: {
            accuracy: boolean
            deliverability: boolean
            relevance: boolean
            compliance: boolean
          }
          created_at?: string
        }
      }
      usage: {
        Row: {
          id: string
          user_id: string
          month_year: string
          audits_used: number
          leads_used: number
          credits_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month_year: string
          audits_used?: number
          leads_used?: number
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month_year?: string
          audits_used?: number
          leads_used?: number
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_usage: {
        Args: {
          user_uuid: string
        }
        Returns: {
          id: string
          user_id: string
          month_year: string
          audits_used: number
          leads_used: number
          credits_used: number
          created_at: string
          updated_at: string
        }
      }
    }
    Enums: {
      plan_type: 'free' | 'starter' | 'growth' | 'pro'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Audit = Database['public']['Tables']['audits']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Usage = Database['public']['Tables']['usage']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']

export type PlanType = Database['public']['Enums']['plan_type']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']
