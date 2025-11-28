

"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { PRODUCTS, LENS_TYPES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star, ShieldCheck, ShoppingBag, Zap, MapPin, Loader2, Undo2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { VirtualTryOn } from '@/components/virtual-try-on';
import type { Lens } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { addDays, format } from 'date-fns';


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const product = PRODUCTS.find(p => p.id === id);
  const { addItem, clearCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const isMobile = useIsMobile();
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);


  const lenses = useMemo(() => LENS_TYPES as Lens[], []);

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

  const placeholder = PlaceHolderImages.find(p => p.id === product.imageId);
  const imageUrl = placeholder?.imageUrl ?? `https://picsum.photos/seed/${product.id}/600/400`;
  const imageHint = placeholder?.imageHint ?? '';
  
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
    addItem(product, quantity, selectedLens ?? undefined);
    toast({
        title: "Success!",
        description: `${quantity} x ${product.name} ${selectedLens ? `with ${selectedLens.name}`: ""} added to your cart.`
    });
  };

  const handleBuyNow = () => {
    clearCart();
    addItem(product, quantity, selectedLens ?? undefined);
    router.push('/checkout');
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
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="aspect-[4/3] relative bg-card rounded-lg shadow-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={imageHint}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        
        <div>
          <p className="text-sm font-medium text-primary">{product.brand}</p>
          <h1 className="text-4xl font-bold tracking-tight mt-1">{product.name}</h1>
          <p className="text-3xl font-light mt-4">{formatPrice(total_price)}</p>

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
              <Button size="lg" className="flex-1 bg-gray-800 hover:bg-gray-900" onClick={handleAddToCart}>
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
            <Button size="lg" variant="default" className="w-full bg-gray-800 hover:bg-gray-900" onClick={handleBuyNow}>
              <Zap className="mr-2 h-5 w-5" />
              Buy Now
            </Button>
          </div>
          
          {isMobile === true && product.type === 'Frames' && (
            <VirtualTryOn product={product}>
              <Button size="lg" variant="outline" className="w-full mt-4">
                Virtual Try-On
              </Button>
            </VirtualTryOn>
          )}

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
                    <p className="mt-2 text-sm text-green-600">Great! Delivery available. Expected by {format(deliveryDate, "eeee, MMMM d")}.</p>
                )}
                {deliveryStatus === 'unavailable' && (
                    <p className="mt-2 text-sm text-destructive">Sorry, delivery is not available to this pincode.</p>
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
    </div>
  );
}

