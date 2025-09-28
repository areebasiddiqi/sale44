import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return null
        // Also store in cookies for server access
        const value = localStorage.getItem(key)
        if (value) {
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=3600; SameSite=Lax`
        }
        return value
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return
        localStorage.setItem(key, value)
        // Also set as cookie for server access
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=3600; SameSite=Lax`
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return
        localStorage.removeItem(key)
        // Also remove cookie
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      }
    }
  }
})

export default supabase
