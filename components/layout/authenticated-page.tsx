import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface AuthenticatedPageProps {
  children: React.ReactNode
  className?: string
}

export async function AuthenticatedPage({ children, className = '' }: AuthenticatedPageProps) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
