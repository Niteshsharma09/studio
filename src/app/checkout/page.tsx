
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
import { CreditCard, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUser } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

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
  paymentMethod: z.enum(["card", "upi", "cod"], {
    required_error: "You need to select a payment method.",
  }),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  expiryDate: z.string().optional(),
  cvc: z.string().optional(),
  upiId: z.string().optional(),
});

const checkoutSchema = shippingSchema.merge(paymentSchema).superRefine((data, ctx) => {
    if (data.paymentMethod === 'card') {
        if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Card number must be 16 digits", path: ["cardNumber"] });
        }
        if (!data.cardName || data.cardName.length < 1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Name on card is required", path: ["cardName"] });
        }
        if (!data.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Expiry must be in MM/YY format", path: ["expiryDate"] });
        }
        if (!data.cvc || !/^\d{3}$/.test(data.cvc)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CVC must be 3 digits", path: ["cvc"] });
        }
    }
    if (data.paymentMethod === 'upi') {
        if (!data.upiId || !/^[\w.-]+@[\w.-]+$/.test(data.upiId)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter a valid UPI ID", path: ["upiId"] });
        }
    }
});


export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
      paymentMethod: "card",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvc: "",
      upiId: ""
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  
  useEffect(() => {
      if (!user) {
          router.push('/login');
      }
  }, [user, router]);

  useEffect(() => {
    if (cartItems.length === 0 && !isProcessing) {
      toast({ title: 'Your cart is empty', description: 'Redirecting you to the homepage.', variant: 'destructive' });
      router.push('/');
    }
  }, [cartItems, router, isProcessing, toast]);
  
  useEffect(() => {
    if (user?.email) {
      form.setValue('email', user.email);
    }
  }, [user, form]);
  
  if (cartItems.length === 0 || !user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);
  };

  const onSubmit = async (values: z.infer<typeof checkoutSchema>) => {
    console.log("Form submitted", values);
    setIsProcessing(true);

    try {
        if (!user) throw new Error("User not authenticated");

        // 1. Create the order document
        const ordersRef = collection(firestore, `users/${user.uid}/orders`);
        const orderDoc = await addDoc(ordersRef, {
            userId: user.uid,
            orderDate: serverTimestamp(),
            totalAmount: cartTotal,
            status: 'pending',
            shippingAddress: `${values.address}, ${values.city}, ${values.zipCode}, ${values.country}`,
            billingAddress: `${values.address}, ${values.city}, ${values.zipCode}, ${values.country}`,
        });

        // 2. Create the order items subcollection
        const orderItemsRef = collection(orderDoc, 'orderItems');
        for (const item of cartItems) {
            await addDoc(orderItemsRef, {
                productId: item.product.id,
                quantity: item.quantity,
                priceAtPurchase: item.product.price + (item.lens?.price || 0),
                productName: item.product.name, // Store some denormalized data
                lensName: item.lens?.name || null,
            });
        }
        
        // 3. Success
        toast({
            title: "Purchase Successful!",
            description: "Thank you for your order. A confirmation has been sent to your email."
        });
        clearCart();
        router.push('/');

    } catch (error) {
        console.error("Order submission failed: ", error);
        toast({
            title: "Order Failed",
            description: "There was a problem submitting your order. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsProcessing(false);
    }
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
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>
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
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Payment Method</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-2"
                                    >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="card" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Credit/Debit Card
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="upi" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        UPI
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="cod" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Cash on Delivery
                                        </FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {paymentMethod === 'card' && (
                            <div className="space-y-4">
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
                            </div>
                        )}
                        {paymentMethod === 'upi' && (
                             <FormField control={form.control} name="upiId" render={({ field }) => (
                                <FormItem><FormLabel>UPI ID</FormLabel><FormControl><Input {...field} placeholder="yourname@bank" /></FormControl><FormMessage /></FormItem>
                            )}/>
                        )}
                         {paymentMethod === 'cod' && (
                             <div className="text-sm text-muted-foreground bg-secondary p-4 rounded-md">
                                You will pay upon delivery.
                            </div>
                        )}
                    </CardContent>
                </Card>

              <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Lock className="mr-2 h-4 w-4" />
                        Pay {formatPrice(cartTotal)}
                    </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

    