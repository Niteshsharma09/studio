
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// This is a temporary solution to avoid errors on environments
// where the service account key is not set.
// A more robust solution would be to use a different middleware
// for local development and production.
let serviceAccount: any;
try {
  serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;
} catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
    serviceAccount = undefined;
}

if (!getApps().length) {
    if (serviceAccount) {
        initializeApp({
            credential: cert(serviceAccount)
        });
    } else {
        console.warn("Firebase Admin SDK not initialized. Admin middleware will not function.");
    }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    // If the SDK wasn't initialized, we can't check auth.
    // Redirect to login as a safe default.
    if (!serviceAccount) {
        console.warn("Redirecting to login due to uninitialized Firebase Admin SDK.");
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const sessionCookie = request.cookies.get('__session')?.value || ''

    try {
      const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);
      
      if (decodedClaims.isAdmin) {
        return NextResponse.next()
      } else {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.search = `redirect=${pathname}`
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Middleware auth error:', error);
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = `redirect=${pathname}`
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
