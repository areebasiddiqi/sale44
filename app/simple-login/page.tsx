'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setStatus('Attempting login...')

    try {
      // First, try to sign up the user (in case they don't exist)
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (signupError && !signupError.message.includes('already registered')) {
        setStatus('Signup error: ' + signupError.message)
        setLoading(false)
        return
      }

      // Now try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setStatus('Login error: ' + error.message)
      } else if (data.user) {
        setStatus('Login successful! User: ' + data.user.email)
        
        // Check if session is set
        const { data: sessionData } = await supabase.auth.getSession()
        console.log('Session after login:', sessionData)
        
        // Wait a moment then redirect
        setTimeout(() => {
          setStatus('Redirecting to dashboard...')
          window.location.href = '/dashboard'
        }, 2000)
      }
    } catch (error) {
      setStatus('Unexpected error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    const { data: sessionData, error } = await supabase.auth.getSession()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    setStatus(`
Session: ${sessionData.session ? 'Found' : 'None'}
User: ${userData.user ? userData.user.email : 'None'}
Session Error: ${error?.message || 'None'}
User Error: ${userError?.message || 'None'}
Cookies: ${document.cookie}
    `)
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setStatus('Logout error: ' + error.message)
    } else {
      setStatus('Logged out successfully')
      window.location.reload()
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple Login Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Login (Creates account if needed)'}
        </button>
        
        <button
          onClick={checkSession}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Check Session
        </button>
        
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
        
        <a
          href="/dashboard"
          className="block w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-center"
        >
          Try Dashboard
        </a>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Status:</h3>
        <pre className="text-sm whitespace-pre-wrap">{status}</pre>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Login" to create account and sign in</li>
          <li>Check the status message</li>
          <li>Click "Check Session" to verify auth state</li>
          <li>Click "Try Dashboard" to test redirect</li>
          <li>Check your terminal for middleware logs</li>
        </ol>
      </div>
    </div>
  )
}
