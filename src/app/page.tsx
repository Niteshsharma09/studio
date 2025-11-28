"use client";

import { useMemo, Suspense } from 'react';
import { ProductCard } from '@/components/product-card';
import { PRODUCTS } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { Product } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const CategoryCard = ({ title, imageId, href }: { title: string, imageId: string, href: string }) => {
    const placeholder = PlaceHolderImages.find(p => p.id === imageId);
    return (
        <Link href={href}>
            <div className="text-center group flex flex-col items-center">
                <div className="relative w-32 h-32 md:w-40 md:h-40 mb-2 transition-shadow group-hover:shadow-lg rounded-full bg-gray-100 overflow-hidden">
                    {placeholder && (
                        <Image
                            src={placeholder.imageUrl}
                            alt={title}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 768px) 128px, 160px"
                        />
                    )}
                </div>
                <p className="font-medium text-sm text-foreground/90">{title}</p>
            </div>
        </Link>
    )
}

const ProductCollection = ({ title, products, id }: { title: string, products: Product[], id: string }) => (
    <section id={id} className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
        {products.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center text-center h-64 bg-card rounded-lg border">
                <h3 className="text-2xl font-semibold">No Products Found</h3>
                <p className="text-muted-foreground mt-2">Check back later for new arrivals in this category.</p>
            </div>
        )}
    </section>
);


function ProductList() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');

  const { frameProducts, sunglassesProducts, lensesProducts, allProducts } = useMemo(() => {
    const all = PRODUCTS;
    return {
        allProducts: all,
        frameProducts: all.filter(p => p.type === 'Frames'),
        sunglassesProducts: all.filter(p => p.type === 'Sunglasses'),
        lensesProducts: all.filter(p => p.type === 'Lenses'),
    }
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery) return null;
    return allProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allProducts]);

  if (searchQuery) {
    return (
        <div className="container mx-auto px-4 py-16">
             <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold">Search results for &quot;{searchQuery}&quot;</h2>
              <p className="text-muted-foreground">{searchResults?.length || 0} products found.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {searchResults?.map(product => (
                <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {searchResults?.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg border mt-8">
                    <h3 className="text-2xl font-semibold">No Products Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search query.</p>
                </div>
            )}
        </div>
    );
  }
  
  return (
    <div>
        <ProductCollection id="frames" title="Frames" products={frameProducts} />
        <Separator />
        <ProductCollection id="sunglasses" title="Sunglasses" products={sunglassesProducts} />
        <Separator />
        <ProductCollection id="lenses" title="Lenses" products={lensesProducts} />
    </div>
  );
}

export default function Home() {
  const heroCarouselImages = PlaceHolderImages.filter(p => p.id.startsWith('hero-carousel-'));
  const categories = [
      { title: 'Eyeglasses', imageId: 'category-eyeglasses', href: '#frames' },
      { title: 'Sunglasses', imageId: 'category-sunglasses', href: '#sunglasses' },
      { title: 'Lenses', imageId: 'category-lenses', href: '#lenses' },
  ]

  return (
    <div>
        <section className="container mx-auto px-4 pt-12 pb-8">
             <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 justify-items-center">
                {categories.map(cat => (
                    <CategoryCard key={cat.title} {...cat} />
                ))}
            </div>
        </section>

      <section className="w-full pb-12">
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full"
        >
          <CarouselContent>
            {heroCarouselImages.map(image => (
              <CarouselItem key={image.id}>
                <div className="relative w-full h-[50vh] min-h-[300px] bg-secondary">
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                    priority={heroCarouselImages.indexOf(image) === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </section>

      <Suspense fallback={<div>Loading products...</div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}
