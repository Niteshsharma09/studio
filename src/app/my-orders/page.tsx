
"use client";

import { useOrders, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, PackageOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function MyOrdersPage() {
    const { user, loading: userLoading } = useUser();
    const { orders, loading: ordersLoading } = useOrders();
    const router = useRouter();

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login?redirect=/my-orders');
        }
    }, [user, userLoading, router]);

    const isLoading = userLoading || ordersLoading;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);
    };

    const getStatusVariant = (status: string) => {
        switch(status.toLowerCase()) {
            case 'pending': return 'secondary';
            case 'shipped': return 'default';
            case 'delivered': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };


    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            {orders.length === 0 ? (
                 <Card className="flex flex-col items-center justify-center h-64 text-center">
                    <CardHeader>
                        <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                        <CardTitle className="mt-4">You have no orders yet.</CardTitle>
                        <CardDescription>Start shopping to see your orders here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/">Browse Products</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {orders.map(order => (
                        <AccordionItem value={order.id} key={order.id} className="bg-card border rounded-lg">
                             <AccordionTrigger className="p-6 text-left hover:no-underline">
                                <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                                    <div className="space-y-1">
                                        <p className="font-bold text-lg">Order #{order.id.slice(0, 7)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.orderDate?.toDate ? format(order.orderDate.toDate(), 'MMMM d, yyyy') : 'Date not available'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                                        <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-6 pt-0">
                                <Separator className="mb-4" />
                                <h4 className="font-semibold mb-4">Order Items</h4>
                                <div className="space-y-4">
                                    {order.items?.map(item => (
                                         <div key={item.id} className="flex justify-between items-center">
                                            <p>{item.productName} {item.lensName ? `w/ ${item.lensName}` : ''} (x{item.quantity})</p>
                                            <p>{formatPrice(item.priceAtPurchase * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                                <Separator className="my-4" />
                                <div className="space-y-2">
                                     <h4 className="font-semibold">Shipping Address</h4>
                                     <p className="text-muted-foreground">{order.shippingAddress}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    )
}
