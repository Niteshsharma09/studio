"use client";

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { PRODUCTS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star, ShieldCheck, Truck, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { VirtualTryOn } from '@/components/virtual-try-on';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const product = PRODUCTS.find(p => p.id === id);
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const isMobile = useIsMobile();

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
        title: "Success!",
        description: `${quantity} x ${product.name} added to your cart.`
    });
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
          <p className="text-3xl font-light mt-4">{formatPrice(product.price)}</p>

          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">(123 reviews)</span>
          </div>
          
          <p className="mt-6 text-foreground/80 leading-relaxed">{product.description}</p>
          
          <div className="mt-8 flex items-center gap-4">
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-20"
              aria-label="Quantity"
            />
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
          
          {isMobile === true && (
            <VirtualTryOn product={product}>
              <Button size="lg" variant="outline" className="w-full mt-4">
                Virtual Try-On
              </Button>
            </VirtualTryOn>
          )}

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="w-5 h-5 text-accent"/>
                <p>2-Year Warranty Included</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-accent"/>
                <p>Free Shipping & Returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
