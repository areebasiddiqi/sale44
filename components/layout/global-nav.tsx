'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/nav'
import type { User } from '@supabase/supabase-js'

export function GlobalNav() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Routes where navigation should be hidden
  const hiddenRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/',
    '/pricing',
    '/about',
    '/contact'
  ]

  // Check if current route should hide navigation
  const shouldHideNav = hiddenRoutes.includes(pathname) || pathname.startsWith('/auth/')

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Don't render anything while loading
  if (loading) {
    return null
  }

  // Don't render nav if user is not authenticated or on hidden routes
  if (!user || shouldHideNav) {
    return null
  }

  // Render the dashboard navigation for authenticated users
  return (
    <>
      <DashboardNav user={user} />
      {/* Add a spacer div to push content below the fixed nav */}
      <div className="h-16" />
    </>
  )
}
