import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const placeholder = PlaceHolderImages.find(p => p.id === product.imageId);
  const imageUrl = placeholder?.imageUrl ?? `https://picsum.photos/seed/${product.id}/600/400`;
  const imageHint = placeholder?.imageHint ?? '';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <Card className="overflow-hidden group transition-all duration-300 border hover:shadow-xl hover:-translate-y-1">
      <Link href={`/product/${product.id}`} aria-label={`View details for ${product.name}`}>
        <div className="relative aspect-video w-full bg-secondary/30">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105 p-4"
              data-ai-hint={imageHint}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-10 h-10 text-white" />
            </div>
        </div>
      </Link>
      <CardContent className="p-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
        <h3 className="font-semibold text-base leading-tight mt-1 h-10">
            <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
              {product.name}
            </Link>
        </h3>
        <p className="font-bold text-lg mt-2">{formatPrice(product.price)}</p>
      </CardContent>
    </Card>
  );
}
