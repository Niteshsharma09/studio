
"use client";

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { PRODUCTS, BRANDS } from '@/lib/data';

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedBrands = useMemo(() => searchParams.get('brands')?.split(',') || [], [searchParams]);
  const minPrice = useMemo(() => Number(searchParams.get('minPrice') || 0), [searchParams]);
  const maxPrice = useMemo(() => Number(searchParams.get('maxPrice') || 9999), [searchParams]);

  const maxProductPrice = useMemo(() => Math.max(...PRODUCTS.map(p => p.price), 500), []);

  const handleBrandChange = (brand: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentBrands = new Set(selectedBrands);
    
    if (currentBrands.has(brand)) {
      currentBrands.delete(brand);
    } else {
      currentBrands.add(brand);
    }

    if (currentBrands.size > 0) {
      newParams.set('brands', Array.from(currentBrands).join(','));
    } else {
      newParams.delete('brands');
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const handlePriceChange = (value: number[]) => {
     const newParams = new URLSearchParams(searchParams);
     newParams.set('minPrice', value[0].toString());
     newParams.set('maxPrice', value[1].toString());
     router.replace(`${pathname}?${newParams.toString()}`);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('brands');
    newParams.delete('minPrice');
    newParams.delete('maxPrice');
    router.replace(`${pathname}?${newParams.toString()}`);
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={clearFilters}>Clear All</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Brand</h3>
          <div className="space-y-2">
            {BRANDS.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => handleBrandChange(brand)}
                />
                <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Price Range</h3>
          <Slider
            min={0}
            max={maxProductPrice}
            step={10}
            defaultValue={[minPrice, maxPrice]}
            onValueChangeCommitted={handlePriceChange}
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>₹{minPrice}</span>
            <span>₹{maxPrice === 9999 ? `${maxProductPrice}+` : `₹${maxPrice}`}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
