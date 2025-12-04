
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Eye, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const placeholder = PlaceHolderImages.find(p => p.id === product.imageId);
  const imageUrl = placeholder?.imageUrl ?? `https://picsum.photos/seed/${product.id}/600/400`;
  const imageHint = placeholder?.imageHint ?? '';
  const { addItem } = useCart();
  const { toast } = useToast();


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className={cn("overflow-hidden group transition-all duration-300 border hover:shadow-xl hover:-translate-y-1", className)}>
      <Link href={`/product/${product.id}`} aria-label={`View details for ${product.name}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-secondary/30">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              data-ai-hint={imageHint}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button size="icon" variant="secondary" className="h-9 w-9" asChild>
                     <div tabIndex={0} role="button">
                        <Eye className="h-4 w-4"/>
                     </div>
                </Button>
                {product.type !== "Lenses" &&
                    <Button size="icon" variant="default" className="h-9 w-9" onClick={handleAddToCart}>
                        <ShoppingCart className="h-4 w-4"/>
                    </Button>
                }
            </div>
        </div>
      </Link>
      <CardContent className="p-4 text-left">
        <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
        <h3 className="font-semibold text-base leading-tight mt-1 h-10">
            <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </Link>
        </h3>
        <p className="font-bold text-lg mt-2">{formatPrice(product.price)}</p>
      </CardContent>
    </Card>
  );
}
