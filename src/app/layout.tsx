import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

export const metadata: Metadata = {
  title: 'technoii',
  description: 'Your destination for the latest tech.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Techno-i',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={cn('font-body antialiased h-full flex flex-col')}>
        <Suspense>
          <FirebaseProvider>
            <CartProvider>
              <Header />
              <main className="flex-1 bg-background">{children}</main>
              <Footer />
            </CartProvider>
          </FirebaseProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
