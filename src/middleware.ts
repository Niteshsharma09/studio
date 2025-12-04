
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Using firebase-admin in middleware is not supported in the Next.js Edge Runtime.
// A different strategy (e.g., API route with session cookies) is needed for full protection.
// This middleware is currently a placeholder to prevent build errors.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    console.log("Admin route accessed. Note: Route protection is not yet fully implemented.");
    // IMPORTANT: Add your actual authentication and authorization logic here.
    // For now, we will allow access but you should protect this route.
  }

  return NextResponse.next()
}

export const config = {
  // We keep the matcher to ensure this middleware only runs for admin routes.
  matcher: ['/admin/:path*'],
}
