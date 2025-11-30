
"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useUser } from "@/firebase";
import Link from "next/link";


export default function OrderSummaryPage() {
  const { cartItems, cartTotal } = useCart();
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && cartItems.length === 0) {
      toast({ title: 'Your cart is empty', description: 'Redirecting you to the homepage.', variant: 'destructive' });
      router.push('/');
    }
  }, [cartItems, router, loading, toast]);
  
  if (loading || cartItems.length === 0) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);
  };

  const handleProceed = () => {
    if (user) {
      router.push('/payment');
    } else {
      router.push('/login?redirect=/payment');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-3xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {cartItems.map(item => {
                        const placeholder = PlaceHolderImages.find(p => p.id === item.product.imageId);
                        const itemPrice = item.product.price + (item.lens?.price ?? 0);
                        return (
                            <div key={`${item.product.id}-${item.lens?.id || ''}`} className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    {placeholder && <Image
                                        src={placeholder.imageUrl}
                                        alt={item.product.name}
                                        width={80}
                                        height={80}
                                        className="rounded-md"
                                    />}
                                    <div>
                                        <p className="font-medium">{item.product.name}</p>
                                        {item.lens && <p className="text-sm text-muted-foreground">+ {item.lens.name}</p>}
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-medium">{formatPrice(itemPrice * item.quantity)}</p>
                            </div>
                        )
                    })}
                    <Separator/>
                    <div className="flex justify-between font-semibold text-xl">
                        <p>Total</p>
                        <p>{formatPrice(cartTotal)}</p>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                     <Button size="lg" className="w-full" onClick={handleProceed}>
                        Proceed to Payment <ArrowRight className="ml-2" />
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/">Continue Shopping</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
