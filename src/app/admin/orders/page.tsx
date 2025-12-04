
'use client';
import { useAllOrders } from '@/hooks/useAdminDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/types';


export default function AdminOrdersPage() {
    const { allOrders, loading } = useAllOrders();
    const firestore = useFirestore();
    const { toast } = useToast();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);
    };

    const handleStatusChange = async (order: Order, status: string) => {
        if (!firestore) return;
        try {
            const orderRef = doc(firestore, `users/${order.userId}/orders/${order.id}`);
            await updateDoc(orderRef, { status });
            toast({ title: "Order Updated", description: `Order status changed to ${status}.`});
        } catch (error) {
            console.error("Failed to update order status:", error);
            toast({ title: "Update Failed", description: "Could not update order status.", variant: "destructive" });
        }
    };


    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>A list of all orders placed in your store.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id.slice(0, 7)}</TableCell>
                                <TableCell>{order.userId.slice(0, 10)}...</TableCell>
                                <TableCell><Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                                <TableCell>{order.orderDate?.toDate ? format(order.orderDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                                <TableCell>{order.items?.length || 0}</TableCell>
                                <TableCell className="text-right">{formatPrice(order.totalAmount)}</TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleStatusChange(order, 'shipped')}>Mark as Shipped</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(order, 'delivered')}>Mark as Delivered</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(order, 'cancelled')}>Mark as Cancelled</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {allOrders.length === 0 && <p className="p-4 text-center text-muted-foreground">No orders found.</p>}
            </CardContent>
        </Card>
    )
}
