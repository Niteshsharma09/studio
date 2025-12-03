
"use client";

import Link from 'next/link';
import { ShoppingBag, Search, Menu, LogOut, LayoutDashboard, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartSheet } from '@/components/cart-sheet';
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';

export function Header() {
  const { cartCount } = useCart();
  const { user, loading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const navLinks = [
    { href: '/?category=frames', label: 'Eyeglasses' },
    { href: '/?category=sunglasses', label: 'Sunglasses' },
    { href: '/?category=lenses', label: 'Lenses' },
    { href: '/?category=contact-lenses', label: 'Contact Lenses' },
    { href: '/style-guide', label: 'Style Guide' },
  ];

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    router.push(`/?${params.toString()}`);
    if(isMobileMenuOpen) setIsMobileMenuOpen(false);
  };
  
  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/');
    } catch (error) {
      console.error("Logout error", error);
      toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: "destructive" });
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const UserMenu = () => {
    if (loading) {
      return <Skeleton className="h-8 w-8 rounded-full" />;
    }
    
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || user.email}</p>
                {user.displayName && <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push('/my-orders')}>
              <History className="mr-2 h-4 w-4" />
              <span>My Orders</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="hidden lg:flex items-center gap-2">
        <Button asChild variant="outline">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4">
        <div className="flex h-16 items-center">
          <div className="flex items-center lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm">
                <div className="px-4 py-6">
                  <Link href="/" className="mb-6 inline-block" onClick={() => setIsMobileMenuOpen(false)}>
                    <Image src="/logo.png" alt="technoii Logo" width={120} height={35} />
                  </Link>
                  
                  <nav className="flex flex-col space-y-4 text-lg">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'font-medium transition-colors hover:text-foreground/80',
                          pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-8 space-y-2">
                    {user ? (
                      <Button onClick={handleLogout} variant="outline" className="w-full">Log Out</Button>
                    ) : (
                      <>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                        </Button>
                        <Button asChild className="w-full">
                          <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
           <div className="mr-2 md:mr-4">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="technoii Logo" width={120} height={30} className="hidden sm:block h-[30px] w-auto"/>
              <Image src="/logo.png" alt="technoii Logo" width={100} height={25} className="sm:hidden h-[25px] w-auto"/>
            </Link>
          </div>
          
           <div className="flex-1 flex justify-center px-2 lg:px-8">
             <div className="w-full max-w-md">
                <form onSubmit={handleSearchSubmit} className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search..." 
                      className="pl-10 h-9 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              </div>
           </div>

          <div className="flex flex-shrink-0 items-center justify-end space-x-1 sm:space-x-2">
            <UserMenu />

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

             {/* Mobile: Account Icon shows user menu or login link */}
             <div className="lg:hidden">
              { !user && !loading && (
                <Link href="/login">
                  <Button variant="ghost" size="icon">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                            U
                        </AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Account</span>
                  </Button>
                </Link>
              )}
             </div>
          </div>
        </div>
      </div>
      
      <nav className="hidden lg:flex container items-center justify-center space-x-8 text-sm font-medium h-12 border-t">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'transition-colors hover:text-primary',
              (pathname + '?' + searchParams.toString()).includes(link.href.substring(1)) ? 'text-primary' : 'text-foreground/80'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
