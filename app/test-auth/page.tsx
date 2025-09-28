'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert('Error: ' + error.message)
      } else {
        alert('Login successful!')
        console.log('Login data:', data)
      }
    } catch (error) {
      alert('Unexpected error occurred')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        alert('Error: ' + error.message)
      } else {
        alert('Signup successful! Check your email for confirmation.')
        console.log('Signup data:', data)
      }
    } catch (error) {
      alert('Unexpected error occurred')
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('Error logging out: ' + error.message)
    } else {
      alert('Logged out successfully!')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        alert('Google login error: ' + error.message)
      }
      console.log('Google login data:', data)
    } catch (error) {
      alert('Unexpected error occurred')
      console.error('Google login error:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      {user ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 rounded">
            <h2 className="font-semibold">Logged in as:</h2>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
            <p>Confirmed: {user.email_confirmed_at ? 'Yes' : 'No'}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
          
          <a
            href="/dashboard"
            className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
          >
            Go to Dashboard
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Sign In'}
              </button>
              
              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Sign Up'}
              </button>
            </div>
          </form>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign in with Google
          </button>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server'}</p>
      </div>
    </div>
  )
}
