
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star, ShieldCheck, Zap, MapPin, Loader2, Undo2, ShoppingCart } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Product, Prescription } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { addDays, format } from 'date-fns';
import { ProductCard } from '@/components/product-card';
import { Separator } from '@/components/ui/separator';
import { PrescriptionDialog } from '@/components/prescription-dialog';
import { ReviewList } from '@/components/review-list';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CarouselApi } from "@/components/ui/carousel"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function ProductDetailClientPage({ product, allProducts, lenses }: { product: Product, allProducts: Product[], lenses: Product[] }) {
  const router = useRouter();
  const { addItem, clearCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedLens, setSelectedLens] = useState<Product | null>(null);
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'cart' | 'buy' | null>(null);

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
 
  useEffect(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap())
 
    const handleSelect = (api: CarouselApi) => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", handleSelect)
 
    return () => {
      api.off("select", handleSelect)
    }
  }, [api])


  const placeholder = PlaceHolderImages.find(p => p.id === product?.imageId);
  const mainImageUrl = placeholder?.imageUrl ?? `https://picsum.photos/seed/${product?.id}/600/400`;

   const thumbnails = useMemo(() => {
    if (!product) return [];
    // Using placeholder images for thumbnails. In a real app, these would be different product shots.
    return [
      mainImageUrl,
      `https://picsum.photos/seed/${product.id}a/600/400`,
      `https://picsum.photos/seed/${product.id}b/600/400`,
      `https://picsum.photos/seed/${product.id}c/600/400`,
    ];
  }, [product, mainImageUrl]);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts.filter(p => p.type === product.type && p.id !== product.id).slice(0, 4);
  }, [product, allProducts]);


  const total_price = useMemo(() => {
    if (!product) return 0;
    return product.price + (selectedLens?.price ?? 0);
  }, [product, selectedLens]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    );
  }
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const handleLensChange = (lensId: string) => {
    if (lensId === 'none') {
      setSelectedLens(null);
    } else {
      const lens = lenses.find(l => l.id === lensId);
      setSelectedLens(lens || null);
    }
  };
  
  const handleAddToCart = () => {
    if (selectedLens) {
        setActionType('cart');
        setIsPrescriptionDialogOpen(true);
    } else {
        addItem(product, quantity);
        toast({
            title: "Success!",
            description: `${quantity} x ${product.name} added to your cart.`
        });
    }
  };

  const handleBuyNow = () => {
    if (selectedLens) {
        setActionType('buy');
        setIsPrescriptionDialogOpen(true);
    } else {
        clearCart();
        addItem(product, quantity);
        router.push('/order-summary');
    }
  };

  const handlePrescriptionProceed = (prescription: Prescription) => {
    if (!selectedLens) return;

    if (actionType === 'buy') {
        clearCart();
    }

    addItem(product, quantity, selectedLens, prescription);

    toast({
        title: "Success!",
        description: `${quantity} x ${product.name} with ${selectedLens.name} added.`
    });

    if (actionType === 'buy') {
        router.push('/order-summary');
    }
  };

  const handlePincodeCheck = () => {
    if (!/^\d{6}$/.test(pincode)) {
        toast({
            variant: "destructive",
            title: "Invalid Pincode",
            description: "Please enter a valid 6-digit Indian pincode."
        });
        return;
    }
    setDeliveryStatus('checking');
    setDeliveryDate(null);
    // Simulate API call
    setTimeout(() => {
        const firstDigit = parseInt(pincode.charAt(0), 10);
        // Simulate serviceability for major metro areas (digits 1-8 are generally used in India)
        if (firstDigit >= 1 && firstDigit <= 8) {
            setDeliveryStatus('available');
            setDeliveryDate(addDays(new Date(), 5));
        } else {
            setDeliveryStatus('unavailable');
        }
    }, 1000);
  };

  return (
    <>
      <div className="animate-fade-in">
          <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
                 <Carousel setApi={setApi} className="w-full">
                    <CarouselContent>
                        {thumbnails.map((imgUrl, index) => (
                        <CarouselItem key={index}>
                            <div className="relative aspect-[4/3] w-full">
                                <Image 
                                    src={imgUrl}
                                    alt={`${product.name} image ${index + 1}`}
                                    fill
                                    className="object-contain rounded-lg"
                                    sizes="(max-width: 1023px) 100vw, 50vw"
                                    priority={index === 0}
                                />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
                </Carousel>
                <div className="grid grid-cols-4 gap-4">
                    {thumbnails.map((thumbUrl, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={cn(
                                'relative aspect-square w-full rounded-md border-2 transition-all duration-200',
                                current === index ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                            )}
                        >
                            <Image
                                src={thumbUrl}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover rounded-sm"
                                sizes="20vw"
                            />
                        </button>
                    ))}
                </div>
            </div>
              
              <div className="animate-fade-in-up lg:col-span-1">
              <p className="text-sm font-medium text-primary">{product.brand}</p>
              <h1 className="text-4xl font-bold tracking-tight mt-1">{product.name}</h1>
              
              <div className="flex items-center mt-4">
                  <p className="text-3xl font-light">{formatPrice(total_price)}</p>
              </div>

              <div className="flex items-center mt-2">
                  <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">(123 reviews)</span>
              </div>
              
              <p className="mt-6 text-foreground/80 leading-relaxed">{product.description}</p>

              {product.type === 'Frames' && (
                  <div className="mt-8 space-y-2">
                  <Label htmlFor="lens-select">Select Lenses (Optional)</Label>
                  <Select onValueChange={handleLensChange} defaultValue="none">
                      <SelectTrigger id="lens-select">
                      <SelectValue placeholder="No lenses" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="none">No lenses</SelectItem>
                      {lenses.map(lens => (
                          <SelectItem key={lens.id} value={lens.id}>
                          {lens.name} {lens.price > 0 ? `(+${formatPrice(lens.price)})` : ''}
                          </SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
                  </div>
              )}
              
              <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4">
                  <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-20"
                      aria-label="Quantity"
                  />
                  <Button size="lg" className="flex-1" onClick={handleAddToCart} variant="default">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                  </Button>
                  </div>
                  <Button size="lg" variant="secondary" className="w-full" onClick={handleBuyNow}>
                  <Zap className="mr-2 h-5 w-5" />
                  Buy Now
                  </Button>
              </div>

              <div className="mt-8 space-y-4">
                  <div>
                  <Label htmlFor="pincode">Check Delivery Availability</Label>
                  <div className="flex items-center gap-2 mt-2">
                      <div className="relative flex-1">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                              id="pincode"
                              placeholder="Enter 6-digit pincode"
                              value={pincode}
                              onChange={(e) => {
                                  setPincode(e.target.value);
                                  setDeliveryStatus('idle');
                              }}
                              className="pl-10"
                              maxLength={6}
                          />
                      </div>
                      <Button onClick={handlePincodeCheck} disabled={deliveryStatus === 'checking'}>
                          {deliveryStatus === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
                      </Button>
                  </div>
                  {deliveryStatus === 'available' && deliveryDate && (
                          <p className="mt-2 text-sm text-green-600 animate-fade-in">Great! Delivery available. Expected by {format(deliveryDate, "eeee, MMMM d")}.</p>
                      )}
                      {deliveryStatus === 'unavailable' && (
                          <p className="mt-2 text-sm text-destructive animate-fade-in">Sorry, delivery is not available to this pincode.</p>
                      )}
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                      <ShieldCheck className="w-5 h-5 text-accent"/>
                      <p>6 Months Warranty Included</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                      <Undo2 className="w-5 h-5 text-accent"/>
                      <p>5-day return policy for unused products</p>
                  </div>
              </div>
              </div>
          </div>
          <div className="container mx-auto px-4 py-16">
              <ReviewList productId={product.id} />
          </div>
          {similarProducts.length > 0 && (
              <div className="container mx-auto px-4 py-16">
              <Separator className="my-8" />
              <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Similar Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {similarProducts.map((p, index) => (
                  <ProductCard 
                      key={p.id} 
                      product={p} 
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms`}}
                  />
                  ))}
              </div>
              </div>
          )}
          {selectedLens && (
              <PrescriptionDialog
                  isOpen={isPrescriptionDialogOpen}
                  onOpenChange={setIsPrescriptionDialogOpen}
                  lens={selectedLens}
                  onProceed={handlePrescriptionProceed}
              />
          )}
          </div>
      </div>
    </>
  );
}
