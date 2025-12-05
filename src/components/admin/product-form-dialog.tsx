
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRANDS, PRODUCT_TYPES } from '@/lib/constants';
import type { Product } from '@/lib/types';
import { useFirestore, useStorage } from '@/firebase';
import { doc, setDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  brand: z.string().min(1, 'Brand is required'),
  type: z.string().min(1, 'Product type is required'),
  gender: z.string().optional(),
});

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

export function ProductFormDialog({ isOpen, onOpenChange, product }: ProductFormDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      brand: '',
      type: '',
      gender: 'Unisex',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        form.reset({
          name: product.name,
          description: product.description,
          price: product.price,
          brand: product.brand,
          type: product.type,
          gender: product.gender || 'Unisex',
        });
        setImagePreview(product.imgurl || null);
      } else {
        form.reset({
          name: '',
          description: '',
          price: 0,
          brand: '',
          type: '',
          gender: 'Unisex',
        });
        setImagePreview(null);
      }
      setNewImageFile(null);
    }
  }, [product, form, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewImageFile(null);
    setImagePreview(null);
  };

 const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !storage) {
        toast({ title: 'Error', description: 'Database or Storage not available.', variant: 'destructive' });
        return;
    }
    
    setIsPending(true);
    let finalImageUrl: string | null = product?.imgurl || null;
    const oldImageUrl = product?.imgurl;

    try {
        // Step 1: Upload new image if it exists
        if (newImageFile && imagePreview) {
            toast({ title: "Uploading image..." });
            const imageRef = ref(storage, `products/${Date.now()}-${newImageFile.name}`);
            
            // imagePreview is a data URL (base64)
            const snapshot = await uploadString(imageRef, imagePreview, 'data_url');
            finalImageUrl = await getDownloadURL(snapshot.ref);
            toast({ title: "Image uploaded!" });
        } else if (!imagePreview && oldImageUrl) {
            // Image was removed
            finalImageUrl = null;
        }

        const productData = { 
            ...values,
            imgurl: finalImageUrl,
        };
        
        // Step 2: Save product data to Firestore
        toast({ title: "Saving product..." });
        if (product) {
            // Editing an existing product
            const productRef = doc(firestore, 'products', product.id);
            await updateDoc(productRef, productData);
            toast({ title: 'Product Updated', description: `${values.name} has been saved successfully.` });
        } else {
            // Creating a new product
            const newDocRef = doc(collection(firestore, 'products'));
            await setDoc(newDocRef, {
                ...productData,
                id: newDocRef.id,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Product Created', description: `${values.name} has been saved successfully.` });
        }
        
        // Step 3: Delete old image from storage if a new one was uploaded or image was removed
        if (oldImageUrl && oldImageUrl !== finalImageUrl) {
            try {
                const oldImageRef = ref(storage, oldImageUrl);
                await deleteObject(oldImageRef);
            } catch (e) {
                console.warn("Could not delete old image, it might have already been deleted:", e);
            }
        }
        
        // Step 4: Refresh page and close dialog
        router.refresh();
        onOpenChange(false);

    } catch (e: any) {
        console.error("Error saving product:", e);
        toast({ 
            title: 'Error Saving Product', 
            description: e.message || "An unknown error occurred. Please check the console.",
            variant: 'destructive',
        });
    } finally {
        setIsPending(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl flex flex-col h-full sm:h-[90vh]">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? "Make changes to your product here. Click save when you're done." : 'Add a new product to your store.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-hidden flex flex-col">
          <ScrollArea className='flex-1'>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 px-1 py-4">
                <div className='flex flex-col space-y-4'>
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} rows={5} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a brand" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {BRANDS.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a product type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {PRODUCT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a gender" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="Men">Men</SelectItem>
                                <SelectItem value="Women">Women</SelectItem>
                                <SelectItem value="Kids">Kids</SelectItem>
                                <SelectItem value="Unisex">Unisex</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
                <div className='flex flex-col space-y-4'>
                    <div>
                        <FormLabel>Product Image</FormLabel>
                        <div className='relative aspect-[4/3] w-full bg-muted rounded-md mt-2 flex items-center justify-center'>
                           {imagePreview ? (
                            <>
                                <Image 
                                    src={imagePreview}
                                    alt="Product image preview" 
                                    fill 
                                    className="object-contain rounded-md"
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10"
                                    onClick={removeImage}
                                >
                                    <X className='h-4 w-4'/>
                                </Button>
                            </>
                           ) : (
                             <div className="text-center text-sm text-muted-foreground p-4">
                                <UploadCloud className='h-8 w-8 mx-auto mb-2'/>
                                No Image
                            </div>
                           )}
                        </div>
                    </div>
                    <Button type="button" variant="outline" onClick={() => document.getElementById('product-image-upload')?.click()}>
                        <UploadCloud className="mr-2 h-4 w-4" /> {imagePreview ? 'Change Image' : 'Add Image'}
                    </Button>
                    <Input id="product-image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                </div>
            </div>
            </ScrollArea>
            <DialogFooter className="md:col-span-2 pt-4 border-t sticky bottom-0 bg-background">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    