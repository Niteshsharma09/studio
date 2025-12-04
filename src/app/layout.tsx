
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Metadata can't be in a client component, so we export it from a server component wrapper
// This is a common pattern for using client-side hooks in the root layout.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full', inter.variable)}>
       <head>
        <title>technoii</title>
        <meta name="description" content="Your destination for the latest tech." />
        <meta name="manifest" content="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Techno-i" />
      </head>
      <body className={cn('font-body antialiased h-full flex flex-col')}>
        <Suspense>
          <FirebaseClientProvider>
            <CartProvider>
              <LayoutContent>{children}</LayoutContent>
            </CartProvider>
          </FirebaseClientProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}


function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Header />}
      <main className={cn("flex-1 bg-background", { "flex flex-col": isAdminPage })}>{children}</main>
      {!isAdminPage && <Footer />}
    </>
  );
}
