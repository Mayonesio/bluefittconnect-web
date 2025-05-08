// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const protectedPaths = ['/', '/productos', '/pedidos', '/blog', '/settings', '/admin']; 
// Paths accessible to unauthenticated users (login, register)
const authPaths = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has('firebaseAuthToken'); // Example: Check for a token set upon Firebase login

  // If user is authenticated
  if (isAuthenticated) {
    // If trying to access login/register page while authenticated, redirect to dashboard
    if (authPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Allow access to other pages
    return NextResponse.next();
  } 
  // If user is not authenticated
  else {
    // If trying to access a protected path, redirect to login
    if (protectedPaths.some(path => pathname === path || (path !== '/' && pathname.startsWith(path)))) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname); // Pass original path for redirection after login
        return NextResponse.redirect(loginUrl);
    }
    // Allow access to public pages (e.g., /auth/login, /auth/register, or any other public static pages)
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (static assets folder if you have one at public/assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
