
"use client";

import { Suspense, useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FilterSidebar } from '@/components/filter-sidebar';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import React from 'react';


const HeroSection = () => {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    const slides = [
        {
            desktopImageId: 'hero-carousel-1-desktop',
            mobileImageId: 'hero-carousel-1-mobile',
            title: 'Clarity in Sight, Style in Mind',
            subtitle: 'Discover our exclusive collection of premium eyewear, crafted with precision for unparalleled comfort and style.',
            buttonText: 'Shop The Collection',
            buttonLink: '/#featured',
        },
        {
            desktopImageId: 'hero-carousel-bogo-desktop',
            mobileImageId: 'hero-carousel-bogo-mobile',
            title: 'Buy One, Get One Free',
            subtitle: 'Select two frames from Titan or Fastrack, and get the second one on us. Perfect for a new look or a spare pair.',
            buttonText: 'Shop The BOGO Sale',
            buttonLink: '/?category=frames&brands=titan,fastrack',
        },
        {
            desktopImageId: 'hero-carousel-2-desktop',
            mobileImageId: 'hero-carousel-2-mobile',
            title: 'Advanced Lens Technology',
            subtitle: 'Experience the world in high definition with our cutting-edge lens options, from blue light filtering to photochromic.',
            buttonText: 'Explore Lenses',
            buttonLink: '/?category=lenses',
        },
        {
            desktopImageId: 'hero-carousel-3-desktop',
            mobileImageId: 'hero-carousel-3-mobile',
            title: 'Sunglasses for Every Season',
            subtitle: 'Protect your eyes and elevate your look with our diverse range of sunglasses, featuring 100% UV protection.',
            buttonText: 'View Sunglasses',
            buttonLink: '/?category=sunglasses',
        },
    ];

    return (
        <section className="relative w-full h-[80vh] min-h-[500px] md:h-[60vh] overflow-hidden">
            <Carousel
                plugins={[plugin.current]}
                className="w-full h-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent className="h-full">
                    {slides.map((slide, index) => {
                        const desktopImage = PlaceHolderImages.find(p => p.id === slide.desktopImageId);
                        const mobileImage = PlaceHolderImages.find(p => p.id === slide.mobileImageId);
                        return (
                            <CarouselItem key={index} className="h-full">
                                <div className="w-full h-full relative">
                                    {desktopImage && (
                                        <Image
                                            src={desktopImage.imageUrl}
                                            alt={desktopImage.description}
                                            fill
                                            className="object-cover hidden md:block animate-zoom-in"
                                            data-ai-hint={desktopImage.imageHint}
                                            priority={index === 0}
                                        />
                                    )}
                                    {mobileImage && (
                                        <Image
                                            src={mobileImage.imageUrl}
                                            alt={mobileImage.description}
                                            fill
                                            className="object-cover md:hidden animate-zoom-in"
                                            data-ai-hint={mobileImage.imageHint}
                                            priority={index === 0}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/50" />
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4 text-white">
                                        <div className="max-w-3xl animate-fade-in-up">
                                            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">{slide.title}</h1>
                                            <p className="mt-4 text-lg md:text-xl max-w-xl mx-auto">{slide.subtitle}</p>
                                            <Button asChild size="lg" className="mt-8">
                                                <Link href={slide.buttonLink}>{slide.buttonText} <ArrowRight className="ml-2"/></Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 hover:bg-black/50 border-white/50 hover:border-white" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/30 hover:bg-black/50 border-white/50 hover:border-white" />
            </Carousel>
        </section>
    );
};


const PromoBanner = () => {
    return (
        <section className="relative w-full bg-primary py-20 my-16 overflow-hidden">
            <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground animate-fade-in-up">
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
        <Link href={href} className="group relative block w-full h-48 md:h-64 overflow-hidden rounded-lg shadow-lg animate-fade-in-up">
             {placeholder && (
                <Image
                    src={placeholder.imageUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            )}
            <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-white tracking-wider">{title}</h3>
            </div>
        </Link>
    )
}

const ProductCollection = ({ title, products, id }: { title: string, products: Product[], id: string }) => (
    <section id={id} className="py-12">
        <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product, index) => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `$\{index * 100}ms`}}
                />
            ))}
        </div>
        {products.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center text-center h-64 bg-card rounded-lg border animate-fade-in">
                <h3 className="text-2xl font-semibold">No Products Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            </div>
        )}
    </section>
);

function ProductList({ allProducts }: { allProducts: Product[] }) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const category = searchParams.get('category');
  const selectedBrands = useMemo(() => searchParams.get('brands')?.split(',') || [], [searchParams]);
  const minPrice = useMemo(() => Number(searchParams.get('minPrice') || 0), [searchParams]);
  const maxPrice = useMemo(() => Number(searchParams.get('maxPrice') || 9999), [searchParams]);
  
  const filteredProducts = useMemo(() => {
    let prods = allProducts;

    if (searchQuery) {
        prods = prods.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    if (selectedBrands.length > 0) {
        prods = prods.filter(product => selectedBrands.includes(product.brand));
    }

    if(category){
        prods = prods.filter(p => p.type.toLowerCase().includes(category));
    }

    prods = prods.filter(product => product.price >= minPrice && product.price <= maxPrice);

    return prods;
  }, [searchQuery, category, selectedBrands, minPrice, maxPrice, allProducts]);

  const title = category ? category.charAt(0).toUpperCase() + category.slice(1) : "Search Results";
  
  return (
      <div className="col-span-12 lg:col-span-9">
          <div className="mb-8 text-center animate-fade-in">
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{filteredProducts.length} products found.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
              {filteredProducts.map((product, index) => (
                  <ProductCard 
                      key={product.id} 
                      product={product} 
                      className="animate-fade-in-up"
                      style={{ animationDelay: `$\{index * 100}ms`}}
                  />
              ))}
          </div>
          {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg border mt-8 animate-fade-in">
                  <h3 className="text-2xl font-semibold">No Products Found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
              </div>
          )}
      </div>
  );
}

function FeaturedProducts({ allProducts }: { allProducts: Product[] }) {
    const featuredProducts = allProducts.slice(0, 8);

    return (
        <div className="col-span-12 lg:col-span-9">
            <ProductCollection id="featured" title="Featured Products" products={featuredProducts} />
        </div>
    );
}


export function HomePageContent({ allProducts }: { allProducts: Product[] }) {
    const categories = [
        { title: 'Eyeglasses', imageId: 'category-eyeglasses', href: '/?category=frames' },
        { title: 'Sunglasses', imageId: 'category-sunglasses', href: '/?category=sunglasses' },
        { title: 'Lenses', imageId: 'category-lenses', href: '/?category=lenses' },
    ]
    const searchParams = useSearchParams();
    const hasFilters = searchParams.has('brands') || searchParams.has('minPrice') || searchParams.has('maxPrice') || searchParams.has('q') || searchParams.has('category');
  
    const showCollections = !hasFilters;
  
    return (
      <div className="animate-fade-in">
          {showCollections && <HeroSection />}
  
          {showCollections && (
              <section className="container mx-auto px-4 py-16">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {categories.map((cat, index) => (
                          <div key={cat.title} style={{animationDelay: `$\{index * 150}ms`}}>
                               <CategoryCard {...cat} />
                          </div>
                      ))}
                  </div>
              </section>
          )}
  
        <div className="container mx-auto px-4 grid grid-cols-12 gap-8 items-start">
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 animate-fade-in">
            <Suspense fallback={<p>Loading filters...</p>}>
              <FilterSidebar />
            </Suspense>
          </aside>

          {hasFilters ? <ProductList allProducts={allProducts} /> : <FeaturedProducts allProducts={allProducts} />}
        
        </div>
        {showCollections && <PromoBanner />}
      </div>
    );
}
