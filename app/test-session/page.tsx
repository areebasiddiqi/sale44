'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkSession = async () => {
    const { data: session, error } = await supabase.auth.getSession()
    const { data: user, error: userError } = await supabase.auth.getUser()
    
    setSessionInfo({
      session: session.session,
      user: user.user,
      sessionError: error,
      userError,
      cookies: document.cookie,
      localStorage: Object.keys(localStorage).filter(key => key.includes('supabase')).map(key => ({
        key,
        value: localStorage.getItem(key)
      }))
    })
  }

  useEffect(() => {
    checkSession()
  }, [])

  const testLogin = async () => {
    setLoading(true)
    try {
      // Try signup first
      await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123'
      })

      // Then login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })

      if (error) {
        alert('Login error: ' + error.message)
      } else {
        alert('Login successful!')
        checkSession()
      }
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testDashboard = () => {
    window.location.href = '/simple-dashboard'
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Session Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Test Login'}
          </button>
          
          <button
            onClick={checkSession}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Refresh Session Info
          </button>
          
          <button
            onClick={testDashboard}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test Dashboard
          </button>
          
          <button
            onClick={() => {
              localStorage.clear()
              sessionStorage.clear()
              document.cookie.split(";").forEach(c => {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
              })
              window.location.reload()
            }}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All & Reload
          </button>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Session Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Test Login" to authenticate</li>
          <li>Check if session info shows user data</li>
          <li>Look at cookies and localStorage</li>
          <li>Click "Test Dashboard" to see if middleware works</li>
          <li>Check terminal for middleware logs</li>
        </ol>
      </div>
    </div>
  )
}
