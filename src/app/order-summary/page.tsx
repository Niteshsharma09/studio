
"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowRight, Loader2, MapPin, Pencil } from "lucide-react";
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

  const lensCharges = cartItems.reduce((total, item) => total + (item.lens?.price ?? 0) * item.quantity, 0);
  const productTotal = cartTotal - lensCharges;

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
    <div className="bg-secondary/50">
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl">Shipping Address</CardTitle>
                        <Button variant="ghost" size="icon" disabled>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                            <div>
                                {user?.displayName && <p className="font-semibold">{user.displayName}</p>}
                                <p className="text-muted-foreground">Your shipping address will be confirmed on the next step.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Order Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cartItems.map(item => {
                            const imageUrl = item.product.imgurl || `https://placehold.co/60x60?text=${item.product.name.charAt(0)}`;
                            const itemPrice = item.product.price + (item.lens?.price ?? 0);
                            return (
                                <div key={`${item.product.id}-${item.lens?.id || ''}`} className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src={imageUrl}
                                            alt={item.product.name}
                                            width={60}
                                            height={60}
                                            className="rounded-md border"
                                        />
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
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Price Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <div className="flex justify-between">
                            <p>Total Amount</p>
                            <p>{formatPrice(productTotal)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Lens Charges</p>
                            <p>+ {formatPrice(lensCharges)}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Net Amount</p>
                            <p>{formatPrice(cartTotal)}</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <p>Total Payable</p>
                            <p>{formatPrice(cartTotal)}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-4">
                     <Button size="lg" className="w-full" onClick={handleProceed}>
                        Make Payment <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
