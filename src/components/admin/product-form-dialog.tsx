
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
import { useFirestore } from '@/firebase';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  brand: z.string().min(1, 'Brand is required'),
  type: z.string().min(1, 'Product type is required'),
  imageUrls: z.array(z.string()).optional(),
  gender: z.string().optional(),
});

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

type ImageFile = {
    file: File;
    preview: string;
};

export function ProductFormDialog({ isOpen, onOpenChange, product }: ProductFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState<ImageFile[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const firestore = useFirestore();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      brand: '',
      type: '',
      imageUrls: [],
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
          imageUrls: product.imageUrls || [],
          gender: product.gender || 'Unisex',
        });
        setExistingImageUrls(product.imageUrls || []);
      } else {
        form.reset({
          name: '',
          description: '',
          price: 0,
          brand: '',
          type: '',
          imageUrls: [],
          gender: 'Unisex',
        });
        setExistingImageUrls([]);
      }
      setNewImageFiles([]);
    }
  }, [product, form, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setNewImageFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(current => current.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls(current => current.filter((_, i) => i !== index));
  };


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    setIsLoading(true);

    try {
        const isNewProduct = !product;
        // Ensure we have a document reference with an ID *before* we do anything else.
        const productRef = isNewProduct
            ? doc(collection(firestore, 'products'))
            : doc(firestore, 'products', product.id);
        
        let uploadedUrls: string[] = [...existingImageUrls];

        if (newImageFiles.length > 0) {
            const storage = getStorage();
            const uploadPromises = newImageFiles.map(imageFile => {
                const imageRef = ref(storage, `products/${productRef.id}/${Date.now()}-${imageFile.file.name}`);
                
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const dataUrl = e.target?.result as string;
                            if (dataUrl) {
                                await uploadString(imageRef, dataUrl, 'data_url');
                                const downloadUrl = await getDownloadURL(imageRef);
                                resolve(downloadUrl);
                            } else {
                                reject(new Error("Couldn't read file"));
                            }
                        } catch (uploadError) {
                            reject(uploadError);
                        }
                    };
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(imageFile.file);
                });
            });
            
            const newUrls = await Promise.all(uploadPromises);
            uploadedUrls = [...uploadedUrls, ...newUrls];
        }

        const productData = { 
            ...values,
            id: productRef.id, // Explicitly add the ID to the data
            imageId: values.name.toLowerCase().replace(/\s+/g, '-'), // Create a fallback imageId
            imageUrls: uploadedUrls,
            ...(isNewProduct ? { createdAt: serverTimestamp() } : {})
        };

        await setDoc(productRef, productData, { merge: true });

        toast({ title: product ? 'Product Updated' : 'Product Created', description: `${values.name} has been saved.` });
        onOpenChange(false);
    } catch (e) {
        console.error("Product form submission error:", e);
        toast({ title: 'Error', description: 'Failed to save product.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
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
                        <FormLabel>Product Images</FormLabel>
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-2'>
                        {existingImageUrls.map((src, index) => (
                             <div key={src} className='relative aspect-square w-full bg-muted rounded-md'>
                                <Image 
                                    src={src}
                                    alt="Existing product image preview" 
                                    fill 
                                    className="object-contain rounded-md"
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => removeExistingImage(index)}
                                >
                                    <X className='h-4 w-4'/>
                                </Button>
                            </div>
                        ))}
                        {newImageFiles.map((imageFile, index) => (
                             <div key={imageFile.preview} className='relative aspect-square w-full bg-muted rounded-md'>
                                <Image 
                                    src={imageFile.preview}
                                    alt="New product image preview" 
                                    fill 
                                    className="object-contain rounded-md"
                                    sizes="(max-width: 768px) 50vw, 33vw"
                                    onLoad={() => URL.revokeObjectURL(imageFile.preview)}
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => removeNewImage(index)}
                                >
                                    <X className='h-4 w-4'/>
                                </Button>
                            </div>
                        ))}
                        </div>
                         {existingImageUrls.length === 0 && newImageFiles.length === 0 && (
                            <div className='relative aspect-[4/3] w-full bg-muted rounded-md mt-2 flex items-center justify-center'>
                                <p className='text-sm text-muted-foreground'>No Images</p>
                            </div>
                         )}
                    </div>
                    <Button type="button" variant="outline" onClick={() => document.getElementById('product-image-upload')?.click()}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Add Images
                    </Button>
                    <Input id="product-image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} multiple/>

                </div>
            </div>
            </ScrollArea>
            <DialogFooter className="md:col-span-2 pt-4 border-t sticky bottom-0 bg-background">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    

    