
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('__session')?.value || ''

    try {
      const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
      
      if (decodedClaims.isAdmin) {
        return NextResponse.next()
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
