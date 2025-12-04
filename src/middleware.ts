
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

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
        console.warn("Firebase Admin SDK not initialized in middleware. Admin routes will not be protected.");
    }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    // If the SDK wasn't initialized, we can't check auth.
    // Redirect to login as a safe default.
    if (!serviceAccount || !getApps().length) {
        console.warn("Redirecting to login due to uninitialized Firebase Admin SDK in middleware.");
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.search = `redirect=${pathname}`
        return NextResponse.redirect(url)
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
      // Session cookie is invalid or expired.
      // A console.error here would be noisy, as it's a common case for logged-out users.
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
