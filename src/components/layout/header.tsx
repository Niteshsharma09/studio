"use client";

import Link from 'next/link';
import { ShoppingBag, Search, Menu, UserCircle } from 'lucide-react';
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
    { href: '/', label: 'Shop' },
    { href: '/style-guide', label: 'Style Guide' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile Nav */}
        <div className="md:hidden flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="px-2 py-6">
                <Link href="/" className="flex items-center space-x-2 mb-8" onClick={() => setIsMobileMenuOpen(false)}>
                  <ShoppingBag className="h-6 w-6 text-primary" />
                  <span className="font-bold">Shady Emporium</span>
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
                  <Button variant="outline" className="w-full">Log In</Button>
                  <Button className="w-full">Sign Up</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Nav */}
        <div className="mr-4 hidden md:flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">
              Shady Emporium
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-1 flex justify-center md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="hidden md:block w-full max-w-xs">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." className="pl-10"/>
                </div>
            </div>
          
           <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost">Log In</Button>
                <Button>Sign Up</Button>
            </div>

          <CartSheet>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Open cart</span>
            </Button>
          </CartSheet>
           <Button variant="ghost" size="icon" className="md:hidden">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">Account</span>
          </Button>
        </div>
      </div>
    </header>
  );
}