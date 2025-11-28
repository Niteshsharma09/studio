
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
import { Button } from '@/components/ui/button';
import { FilterSidebar } from '@/components/filter-sidebar';

const CategoryCard = ({ title, imageId, href }: { title: string, imageId: string, href: string }) => {
    const placeholder = PlaceHolderImages.find(p => p.id === imageId);
    return (
        <Link href={href}>
            <div className="text-center group flex flex-col items-center">
                <div className="relative w-32 h-32 md:w-40 md:h-40 mb-2 transition-all duration-300 group-hover:shadow-lg rounded-full bg-gray-100 overflow-hidden">
                    {placeholder && (
                        <Image
                            src={placeholder.imageUrl}
                            alt={title}
                            fill
                            className="object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 128px, 160px"
                        />
                    )}
                </div>
                <p className="font-medium text-sm text-foreground/90 transition-colors group-hover:text-primary">{title}</p>
            </div>
        </Link>
    )
}

const ProductCollection = ({ title, products, id, showAllLink }: { title: string, products: Product[], id: string, showAllLink?: string }) => (
    <section id={id} className="py-12 animate-fade-in-up">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            {showAllLink && (
              <Button asChild variant="outline">
                  <Link href={showAllLink}>Show All</Link>
              </Button>
            )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
        {products.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center text-center h-64 bg-card rounded-lg border">
                <h3 className="text-2xl font-semibold">No Products Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            </div>
        )}
    </section>
);

function ProductList() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const category = searchParams.get('category');
  const selectedBrands = useMemo(() => searchParams.get('brands')?.split(',') || [], [searchParams]);
  const minPrice = useMemo(() => Number(searchParams.get('minPrice') || 0), [searchParams]);
  const maxPrice = useMemo(() => Number(searchParams.get('maxPrice') || 9999), [searchParams]);

  const filteredProducts = useMemo(() => {
    let products = PRODUCTS;

    if (searchQuery) {
        products = products.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    if (selectedBrands.length > 0) {
        products = products.filter(product => selectedBrands.includes(product.brand));
    }

    products = products.filter(product => product.price >= minPrice && product.price <= maxPrice);

    return products;
  }, [searchQuery, selectedBrands, minPrice, maxPrice]);

  const { frameProducts, sunglassesProducts, lensesProducts } = useMemo(() => {
    return {
        frameProducts: filteredProducts.filter(p => p.type === 'Frames'),
        sunglassesProducts: filteredProducts.filter(p => p.type === 'Sunglasses'),
        lensesProducts: filteredProducts.filter(p => p.type === 'Lenses'),
    }
  }, [filteredProducts]);

  if (category) {
    const productsToDisplay = category === 'frames' ? frameProducts 
                            : category === 'sunglasses' ? sunglassesProducts 
                            : category === 'lenses' ? lensesProducts 
                            : [];
    const title = category.charAt(0).toUpperCase() + category.slice(1);
    
    return (
        <div className="col-span-12 lg:col-span-9 animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold">{title}</h2>
              <p className="text-muted-foreground">{productsToDisplay?.length || 0} products found.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsToDisplay?.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {productsToDisplay?.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg border mt-8">
                    <h3 className="text-2xl font-semibold">No Products Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
  }
  
  return (
    <div className="col-span-12 lg:col-span-9">
        <ProductCollection id="frames" title="Frames" products={frameProducts} showAllLink="/?category=frames" />
        <Separator />
        <ProductCollection id="sunglasses" title="Sunglasses" products={sunglassesProducts} showAllLink="/?category=sunglasses" />
        <Separator />
        <ProductCollection id="lenses" title="Lenses" products={lensesProducts} showAllLink="/?category=lenses" />
    </div>
  );
}

export default function Home() {
  const heroCarouselImages = PlaceHolderImages.filter(p => p.id.startsWith('hero-carousel-'));
  const categories = [
      { title: 'Eyeglasses', imageId: 'category-eyeglasses', href: '/?category=frames' },
      { title: 'Sunglasses', imageId: 'category-sunglasses', href: '/?category=sunglasses' },
      { title: 'Lenses', imageId: 'category-lenses', href: '/?category=lenses' },
  ]
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const hasFilters = searchParams.has('brands') || searchParams.has('minPrice') || searchParams.has('maxPrice') || searchParams.has('q');

  const shouldShowCollections = !category && !hasFilters;

  return (
    <div>
        {shouldShowCollections && (
            <>
                <section className="container mx-auto px-4 pt-12 pb-8 animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 justify-items-center">
                        {categories.map(cat => (
                            <CategoryCard key={cat.title} {...cat} />
                        ))}
                    </div>
                </section>

                <section className="w-full pb-12 animate-fade-in">
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
            </>
        )}

      <div className="container mx-auto px-4 grid grid-cols-12 gap-8 items-start">
        <aside className="hidden lg:block lg:col-span-3">
          <Suspense fallback={<p>Loading filters...</p>}>
            <FilterSidebar />
          </Suspense>
        </aside>
        <Suspense fallback={<div>Loading products...</div>}>
            <ProductList />
        </Suspense>
      </div>
    </div>
  );
}
