"use client";

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import { PRODUCTS, BRANDS, PRODUCT_TYPES } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export default function Home() {
  const [filters, setFilters] = useState<{ types: string[]; brands: string[] }>({
    types: [],
    brands: [],
  });

  const handleFilterChange = (category: 'types' | 'brands', value: string) => {
    setFilters(prev => {
      const newValues = prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value];
      return { ...prev, [category]: newValues };
    });
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const typeMatch = filters.types.length === 0 || filters.types.includes(product.type);
      const brandMatch = filters.brands.length === 0 || filters.brands.includes(product.brand);
      return typeMatch && brandMatch;
    });
  }, [filters]);
  
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  return (
    <div>
      <section className="relative w-full h-[60vh] min-h-[400px] bg-secondary/30">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-end text-center text-white p-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Crystal Clear Vision</h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl">Find the perfect frames that define your style.</p>
          <Button size="lg" asChild className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Link href="#products">Shop Now</Link>
          </Button>
        </div>
      </section>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg border">
                    <h3 className="text-2xl font-semibold">No Products Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
