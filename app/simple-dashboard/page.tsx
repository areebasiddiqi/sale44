import { createClient } from '@/lib/supabase/server'

export default async function SimpleDashboardPage() {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
          <p>Error: {error.message}</p>
          <a href="/simple-login" className="text-blue-600 underline">Go to Login</a>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-yellow-600">Not Authenticated</h1>
          <p>No user found in session</p>
          <a href="/simple-login" className="text-blue-600 underline">Go to Login</a>
        </div>
      )
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-green-600">Dashboard - Authenticated!</h1>
        <div className="mt-4 space-y-2">
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
          <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
        </div>
        
        <div className="mt-6 space-x-4">
          <a href="/simple-login" className="text-blue-600 underline">Back to Login</a>
          <a href="/dashboard" className="text-blue-600 underline">Try Real Dashboard</a>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Server Error</h1>
        <p>Error: {error.message}</p>
        <a href="/simple-login" className="text-blue-600 underline">Go to Login</a>
      </div>
    )
  }
}
