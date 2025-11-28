"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { ProductCard } from '@/components/product-card';
import { PRODUCTS, BRANDS, PRODUCT_TYPES } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const CategoryCard = ({ title, imageId, href }: { title: string, imageId: string, href: string }) => {
    const placeholder = PlaceHolderImages.find(p => p.id === imageId);
    return (
        <Link href={href}>
            <div className="text-center group">
                <Card className="overflow-hidden mb-2 bg-gray-100 border-0 group-hover:shadow-md transition-shadow">
                    <div className="relative aspect-[2/1]">
                        {placeholder && (
                            <Image
                                src={placeholder.imageUrl}
                                alt={title}
                                fill
                                className="object-contain p-2"
                                sizes="200px"
                            />
                        )}
                    </div>
                </Card>
                <p className="font-medium text-sm text-foreground/90">{title}</p>
            </div>
        </Link>
    )
}

function ProductFiltersAndList() {
  const searchParams = useSearchParams();
  const typeFilterFromUrl = searchParams.get('type');
  const searchQuery = searchParams.get('q');

  const [filters, setFilters] = useState<{ types: string[]; brands: string[] }>({
    types: typeFilterFromUrl ? [typeFilterFromUrl] : [],
    brands: [],
  });

  useEffect(() => {
    const newTypes = typeFilterFromUrl ? [typeFilterFromUrl] : [];
    // Only update if the type filter from URL has actually changed
    // This prevents re-setting filters when search query changes
    setFilters(prev => ({ ...prev, types: newTypes }));
  }, [typeFilterFromUrl]);


  const handleFilterChange = (category: 'types' | 'brands', value: string) => {
    setFilters(prev => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const typeMatch = filters.types.length === 0 || filters.types.includes(product.type);
      const brandMatch = filters.brands.length === 0 || filters.brands.includes(product.brand);
      const searchMatch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && brandMatch && searchMatch;
    });
  }, [filters, searchQuery]);
  
  return (
    <div id="products" className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-24 p-6 bg-card rounded-lg border">
            <h2 className="text-xl font-bold mb-6">Filters</h2>
            
            <div>
              <h3 className="font-semibold mb-4 text-base">Product Type</h3>
              <div className="space-y-3">
                {PRODUCT_TYPES.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`type-${type}`}
                      checked={filters.types.includes(type)}
                      onCheckedChange={() => handleFilterChange('types', type)}
                    />
                    <Label htmlFor={`type-${type}`} className="cursor-pointer text-sm font-normal">{type}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="font-semibold mb-4 text-base">Brand</h3>
              <div className="space-y-3">
                {BRANDS.map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`brand-${brand}`}
                      checked={filters.brands.includes(brand)}
                      onCheckedChange={() => handleFilterChange('brands', brand)}
                    />
                    <Label htmlFor={`brand-${brand}`} className="cursor-pointer text-sm font-normal">{brand}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {searchQuery && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Search results for &quot;{searchQuery}&quot;</h2>
              <p className="text-muted-foreground">{filteredProducts.length} products found.</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg border">
                  <h3 className="text-2xl font-semibold">No Products Found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your filters or search query.</p>
              </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  const heroCarouselImages = PlaceHolderImages.filter(p => p.id.startsWith('hero-carousel-'));
  const categories = [
      { title: 'Eyeglasses', imageId: 'category-eyeglasses', href: '/?type=Frames#products' },
      { title: 'Sunglasses', imageId: 'category-sunglasses', href: '/?type=Sunglasses#products' },
      { title: 'Lenses', imageId: 'category-lenses', href: '/?type=Lenses#products' },
      { title: 'Contact Lenses', imageId: 'category-lenses', href: '/?type=Lenses#products' },
  ]

  return (
    <div>
        <section className="container mx-auto px-4 pt-8 pb-4">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
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

      <Suspense fallback={<div>Loading filters...</div>}>
        <ProductFiltersAndList />
      </Suspense>
    </div>
  );
}
