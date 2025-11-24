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
      <section className="relative w-full h-[50vh] min-h-[300px] bg-secondary">
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
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-primary-foreground p-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">See the World Differently</h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl">Discover our curated collection of premium eyewear.</p>
          <Button size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground">
            Shop Now
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <div className="sticky top-20">
              <h2 className="text-2xl font-bold mb-4">Filters</h2>
              
              <div>
                <h3 className="font-semibold mb-2">Product Type</h3>
                <div className="space-y-2">
                  {PRODUCT_TYPES.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`type-${type}`}
                        onCheckedChange={() => handleFilterChange('types', type)}
                      />
                      <Label htmlFor={`type-${type}`} className="cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-semibold mb-2">Brand</h3>
                <div className="space-y-2">
                  {BRANDS.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`brand-${brand}`}
                        onCheckedChange={() => handleFilterChange('brands', brand)}
                      />
                      <Label htmlFor={`brand-${brand}`} className="cursor-pointer">{brand}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg shadow-sm">
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
