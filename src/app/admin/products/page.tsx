
'use client';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { use, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { ProductFormDialog } from '@/components/admin/product-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFirestore } from '@/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
    const products = use(getProducts());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setDialogOpen(true);
    }
    
    const handleNew = () => {
        setSelectedProduct(undefined);
        setDialogOpen(true);
    }

    const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setDeleteAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedProduct || !firestore) return;
        try {
            await deleteDoc(doc(firestore, "products", selectedProduct.id));
            toast({ title: "Product Deleted", description: `${selectedProduct.name} has been deleted.` });
            // This won't auto-refresh since getProducts is cached, a full page reload or revalidation is needed.
            // For this simple case, we'll rely on the user refreshing.
        } catch(e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
        }
        setDeleteAlertOpen(false);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Products ({products.length})</h1>
                <Button onClick={handleNew}>Add New Product</Button>
            </div>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell"><span className="sr-only">Image</span></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead className="hidden md:table-cell">Gender</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(product => {
                                const placeholder = PlaceHolderImages.find(p => p.id === product.imageId);
                                return (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={product.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={placeholder?.imageUrl || '/placeholder.svg'}
                                            width="64"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell><Badge variant="outline">{product.type}</Badge></TableCell>
                                    <TableCell>{product.brand}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.gender || "N/A"}</TableCell>
                                    <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(product)}>Edit</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ProductFormDialog
                isOpen={dialogOpen}
                onOpenChange={setDialogOpen}
                product={selectedProduct}
            />

            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the product
                        &quot;{selectedProduct?.name}&quot;.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
