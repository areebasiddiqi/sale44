import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)
          if (cookie?.value) {
            try {
              return decodeURIComponent(cookie.value)
            } catch {
              return cookie.value
            }
          }
          return undefined
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Skip middleware for certain paths
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/test-auth') ||
    request.nextUrl.pathname.startsWith('/test-session') ||
    request.nextUrl.pathname.startsWith('/simple-login') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return response
  }

  try {
    // Also check for session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Auth routes - redirect to dashboard if already logged in
    if (request.nextUrl.pathname.startsWith('/auth')) {
      if (user && request.nextUrl.pathname !== '/auth/callback') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return response
    }

    // Protected routes - redirect to login if not authenticated
    const protectedPaths = ['/dashboard', '/audits', '/leads', '/billing']
    const isProtectedPath = protectedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    )

    if (isProtectedPath && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login for protected paths
    const protectedPaths = ['/dashboard', '/audits', '/leads', '/billing']
    const isProtectedPath = protectedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    )
    
    if (isProtectedPath) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
