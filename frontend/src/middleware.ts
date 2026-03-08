import { type NextRequest, NextResponse } from 'next/server'
import { betterFetch } from "@better-fetch/fetch"
import type { Session } from "better-auth/types"

export async function middleware(request: NextRequest) {
  // Check the session securely by hitting the better-auth API via betterFetch
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    { 
      baseURL: process.env.BETTER_AUTH_URL || request.nextUrl.origin, 
      headers: { cookie: request.headers.get("cookie") || "" } 
    }
  );

  const isProtectedRoute = request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/map') ||
    request.nextUrl.pathname.startsWith('/quests') ||
    request.nextUrl.pathname.startsWith('/attendance') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/leaderboard')

  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users from / to /map
  if (request.nextUrl.pathname === '/' && session) {
    const url = request.nextUrl.clone()
    url.pathname = '/map'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/update-password')

  if (isAuthRoute && session) {
    const url = request.nextUrl.clone()
    url.pathname = '/map'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
