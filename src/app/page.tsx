
"use client";

import { useMemo, Suspense } from 'react';
import { ProductCard } from '@/components/product-card';
import { PRODUCTS } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FilterSidebar } from '@/components/filter-sidebar';
import { ArrowRight, ShoppingBag } from 'lucide-react';

const HeroSection = () => {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
    return (
        <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-center bg-secondary animate-fade-in">
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
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 p-4 text-primary-foreground max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">Clarity in Sight, Style in Mind</h1>
                <p className="mt-4 text-lg md:text-xl max-w-xl mx-auto">Discover our exclusive collection of premium eyewear, crafted with precision for unparalleled comfort and style.</p>
                <Button asChild size="lg" className="mt-8">
                    <Link href="/#featured">Shop Now <ArrowRight className="ml-2"/></Link>
                </Button>
            </div>
        </section>
    )
}

const PromoBanner = () => {
    const bannerImage = PlaceHolderImages.find(p => p.id === 'promo-banner-image');
    return (
        <section className="relative w-full bg-secondary py-20 my-16">
            {bannerImage && (
                <Image
                    src={bannerImage.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    data-ai-hint={bannerImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
                <h2 className="text-sm font-bold uppercase tracking-widest">Limited Time Offer</h2>
                <p className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">Buy One, Get One Free</p>
                <p className="mt-4 max-w-xl mx-auto text-lg">Select two frames from Titan or Fastrack, and get the second one on us. Perfect for a new look or a spare pair.</p>
                 <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/?category=frames&brands=titan,fastrack">Shop The BOGO Sale <ShoppingBag className="ml-2"/></Link>
                </Button>
            </div>
        </section>
    )
}

const CategoryCard = ({ title, imageId, href }: { title: string, imageId: string, href: string }) => {
    const placeholder = PlaceHolderImages.find(p => p.id === imageId);
    return (
        <Link href={href} className="group relative block w-full h-48 md:h-64 overflow-hidden rounded-lg shadow-lg">
             {placeholder && (
                <Image
                    src={placeholder.imageUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-white tracking-wider">{title}</h3>
            </div>
        </Link>
    )
}

const ProductCollection = ({ title, products, id }: { title: string, products: Product[], id: string }) => (
    <section id={id} className="py-12 animate-fade-in-up">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {products.map(product => (
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

  if (category) {
    const productsToDisplay = filteredProducts.filter(p => p.type.toLowerCase().includes(category));
    const title = category.charAt(0).toUpperCase() + category.slice(1);
    
    return (
        <div className="col-span-12 lg:col-span-9 animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold">{title}</h2>
              <p className="text-muted-foreground">{productsToDisplay?.length || 0} products found.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
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
  
  const featuredProducts = filteredProducts.slice(0, 8);

  return (
    <div className="col-span-12 lg:col-span-9">
        <ProductCollection id="featured" title="Featured Products" products={featuredProducts} />
    </div>
  );
}

export default function Home() {
  const categories = [
      { title: 'Eyeglasses', imageId: 'category-eyeglasses', href: '/?category=frames' },
      { title: 'Sunglasses', imageId: 'category-sunglasses', href: '/?category=sunglasses' },
      { title: 'Lenses', imageId: 'category-lenses', href: '/?category=lenses' },
  ]
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const hasFilters = searchParams.has('brands') || searchParams.has('minPrice') || searchParams.has('maxPrice') || searchParams.has('q');

  const showCollections = !category && !hasFilters;

  return (
    <div>
        {showCollections && <HeroSection />}

        {showCollections && (
            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {categories.map(cat => (
                        <CategoryCard key={cat.title} {...cat} />
                    ))}
                </div>
            </section>
        )}

      <div className="container mx-auto px-4 grid grid-cols-12 gap-8 items-start">
        <aside className="hidden lg:block lg:col-span-3 sticky top-20">
          <Suspense fallback={<p>Loading filters...</p>}>
            <FilterSidebar />
          </Suspense>
        </aside>
        <Suspense fallback={<div>Loading products...</div>}>
            <ProductList />
        </Suspense>
      </div>
      {showCollections && <PromoBanner />}
    </div>
  );
}
