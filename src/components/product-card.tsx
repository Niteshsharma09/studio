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
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/product/${product.id}`} aria-label={`View details for ${product.name}`}>
        <div className="relative aspect-[3/2] w-full bg-muted">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={imageHint}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="secondary" size="sm" tabIndex={-1}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                </Button>
            </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
                <h3 className="font-semibold text-lg leading-tight truncate">
                    <Link href={`/product/${product.id}`} className="hover:underline">{product.name}</Link>
                </h3>
            </div>
            <p className="font-bold text-lg text-primary">{formatPrice(product.price)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
