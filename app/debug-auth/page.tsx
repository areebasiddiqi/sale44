'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('Session check:', { sessionData, sessionError })

        // Check user
        const { data: userData, error: userError } = await supabase.auth.getUser()
        console.log('User check:', { userData, userError })

        setAuthState({
          session: sessionData.session,
          user: userData.user,
          sessionError,
          userError,
          cookies: document.cookie,
          localStorage: {
            supabaseAuth: localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')
          }
        })
      } catch (error) {
        console.error('Auth check error:', error)
        setAuthState({ error: error.message })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session)
      checkAuth()
    })

    return () => subscription.unsubscribe()
  }, [])

  const testLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })
      console.log('Test login result:', { data, error })
      alert(`Login result: ${error ? error.message : 'Success'}`)
    } catch (error) {
      console.error('Test login error:', error)
      alert('Login error: ' + error.message)
    }
  }

  const testLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      console.log('Test logout result:', { error })
      alert(`Logout result: ${error ? error.message : 'Success'}`)
    } catch (error) {
      console.error('Test logout error:', error)
      alert('Logout error: ' + error.message)
    }
  }

  const clearStorage = () => {
    localStorage.clear()
    sessionStorage.clear()
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    window.location.reload()
  }

  if (loading) {
    return <div className="p-8">Loading auth state...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Actions</h2>
          
          <button
            onClick={testLogin}
            className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Login
          </button>
          
          <button
            onClick={testLogout}
            className="block w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test Logout
          </button>
          
          <button
            onClick={clearStorage}
            className="block w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Clear All Storage
          </button>
          
          <a
            href="/dashboard"
            className="block w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-center"
          >
            Try Dashboard
          </a>
          
          <a
            href="/auth/login"
            className="block w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-center"
          >
            Go to Login
          </a>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Auth State</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Environment</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server'}</p>
          <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'Server'}</p>
        </div>
      </div>
    </div>
  )
}
