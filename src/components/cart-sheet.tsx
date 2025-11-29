"use client";

import Link from 'next/link';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/context/cart-context';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Trash2, ShoppingBag } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartCount > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 p-6">
                {cartItems.map((item) => {
                  const placeholder = PlaceHolderImages.find(p => p.id === item.product.imageId);
                  const imageUrl = placeholder?.imageUrl ?? `https://picsum.photos/seed/${item.product.id}/100/100`;
                  const imageHint = placeholder?.imageHint ?? '';
                  const itemPrice = item.product.price + (item.lens?.price ?? 0);
                  
                  return (
                    <div key={`${item.product.id}-${item.lens?.id || ''}`} className="flex items-start justify-between space-x-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={imageUrl}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                          data-ai-hint={imageHint}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        {item.lens && (
                          <p className="text-sm text-muted-foreground">+ {item.lens.name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{formatPrice(itemPrice)}</p>
                        <div className="mt-2 flex items-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value, 10), item.lens?.id)}
                            className="w-16 h-8"
                            aria-label={`Quantity for ${item.product.name}`}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <p className="font-medium">{formatPrice(itemPrice * item.quantity)}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeItem(item.product.id, item.lens?.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove {item.product.name}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6">
              <div className="flex w-full flex-col gap-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                <SheetClose asChild>
                  <Button asChild size="lg" className="w-full">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center p-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground">Add some items to get started.</p>
            <SheetClose asChild>
                <Button asChild>
                    <Link href="/">Browse Products</Link>
                </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
