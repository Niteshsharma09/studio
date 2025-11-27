"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const shippingSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(5, "A valid ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  cardName: z.string().min(1, "Name on card is required"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format"),
  cvc: z.string().regex(/^\d{3}$/, "CVC must be 3 digits"),
});

const checkoutSchema = shippingSchema.merge(paymentSchema);

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvc: "",
    },
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/');
    }
  }, [cartItems, router]);
  
  if (cartItems.length === 0) {
    return null; // Or a loading spinner while redirecting
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);
  };

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    console.log("Form submitted", values);
    toast({
        title: "Purchase Successful!",
        description: "Thank you for your order. A confirmation has been sent to your email."
    });
    clearCart();
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="lg:order-2">
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cartItems.map(item => {
                        const placeholder = PlaceHolderImages.find(p => p.id === item.product.imageId);
                        return (
                            <div key={item.product.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    {placeholder && <Image
                                        src={placeholder.imageUrl}
                                        alt={item.product.name}
                                        width={64}
                                        height={64}
                                        className="rounded-md"
                                    />}
                                    <div>
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                            </div>
                        )
                    })}
                    <Separator/>
                    <div className="flex justify-between font-semibold text-lg">
                        <p>Total</p>
                        <p>{formatPrice(cartTotal)}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:order-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => (
                                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="lastName" render={({ field }) => (
                                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem className="md:col-span-2"><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="zipCode" render={({ field }) => (
                                <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="country" render={({ field }) => (
                            <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <FormField control={form.control} name="cardName" render={({ field }) => (
                            <FormItem><FormLabel>Name on Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="cardNumber" render={({ field }) => (
                            <FormItem><FormLabel>Card Number</FormLabel><FormControl><div className="relative"><CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input {...field} className="pl-10" /></div></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="expiryDate" render={({ field }) => (
                                <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input {...field} placeholder="MM/YY" /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="cvc" render={({ field }) => (
                                <FormItem><FormLabel>CVC</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </CardContent>
                </Card>

              <Button type="submit" size="lg" className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Pay {formatPrice(cartTotal)}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
