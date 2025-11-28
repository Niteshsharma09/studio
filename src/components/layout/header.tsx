"use client";

import Link from 'next/link';
import { ShoppingBag, Search, Menu, UserCircle, Tv, Heart, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartSheet } from '@/components/cart-sheet';
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function Header() {
  const { cartCount } = useCart();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Eyeglasses' },
    { href: '/?type=Sunglasses', label: 'Sunglasses' },
    { href: '/?type=Lenses', label: 'Lenses' },
    { href: '/style-guide', label: 'Style Guide' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        {/* Top bar */}
        <div className="flex h-16 items-center">
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm">
                <div className="px-2 py-6">
                  <Link href="/" className="flex items-center space-x-2 mb-8" onClick={() => setIsMobileMenuOpen(false)}>
                    <Tv className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">technoii</span>
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'text-lg font-medium transition-colors hover:text-foreground/80',
                          pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                   <div className="mt-8 space-y-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Logo & Phone */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <Tv className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl">
                technoii
              </span>
            </Link>
            <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>99998 99998</span>
            </div>
          </div>
          
          {/* Mobile Logo (centered) */}
          <div className="flex-1 flex justify-center lg:hidden">
               <Link href="/" className="flex items-center space-x-2">
                <Tv className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">
                  technoii
                </span>
              </Link>
          </div>
          
          {/* Search bar */}
          <div className="hidden lg:flex flex-1 justify-center px-8">
            <div className="w-full max-w-md">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="What are you looking for?" className="pl-10"/>
                  </div>
              </div>
          </div>

          {/* Right Side: Auth, Wishlist, Cart */}
          <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
              <div className="hidden lg:flex items-center gap-4 text-sm font-medium">
                  <Link href="/login" className="hover:underline">Sign In & Sign Up</Link>
                  <Link href="#" className="flex items-center gap-1 hover:underline">
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Link>
              </div>

            <CartSheet>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Open cart</span>
              </Button>
            </CartSheet>

             {/* Mobile: Account Icon as placeholder */}
             <Button variant="ghost" size="icon" className="lg:hidden">
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">Account</span>
            </Button>
          </div>
        </div>

        {/* Bottom Nav */}
        <nav className="hidden lg:flex items-center justify-center space-x-8 text-sm font-medium h-12 border-t">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === link.href && !usePathname().includes('?') ? 'text-primary' : 'text-foreground/80'
              )}
            >
              {link.label}
            </Link>
          ))}
           <Link
              href="#"
              className="font-bold text-sm text-blue-500 hover:underline"
            >
              3D TRY ON
            </Link>
        </nav>
      </div>
    </header>
  );
}
