
import type { Product } from './types';
import { unstable_cache as cache } from 'next/cache';

export const BRANDS = ['titan', 'fastrack', 'Technoii', 'velocity', 'X-Ford', 'Lauredale Eyewear', 'NVG'] as const;
export const PRODUCT_TYPES = ['Frames', 'Lenses', 'Sunglasses'] as const;

export const getLenses = cache(
    async () => {
        console.log('Fetching lenses...');
        // In a real app, this would be a database call.
        return LENS_TYPES_DATA;
    },
    ['lenses'],
    { revalidate: 3600 } // Revalidate every hour
);

export const getProducts = cache(
    async () => {
        console.log('Fetching products...');
        return PRODUCTS_DATA;
    },
    ['products'],
    { revalidate: 3600 }
);

export const getProduct = cache(
    async (id: string) => {
        console.log(`Fetching product ${id}...`);
        return PRODUCTS_DATA.find(p => p.id === id);
    },
    ['product'],
    { revalidate: 3600 }
);


const LENS_TYPES_DATA: Product[] = [
  {
    id: 'lens-zero',
    name: 'Zero Power',
    description: 'Standard lenses with no prescription. Includes anti-glare coating.',
    price: 450.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'clearblue-lenses',
  },
  {
    id: 'lens-single-vision-basic',
    name: 'Single Vision - Basic',
    description: 'Standard single vision lenses for one field of vision. Includes anti-glare.',
    price: 450.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'clearblue-lenses',
  },
  {
    id: 'lens-single-vision-premium',
    name: 'Single Vision - Premium',
    description: 'Thinner and lighter lenses with superior scratch resistance and UV protection.',
    price: 650.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'clearblue-lenses',
  },
  {
    id: 'lens-single-vision-ultra-premium',
    name: 'Single Vision - Ultra Premium',
    description: 'Digitally surfaced lenses for wider fields of view and reduced distortion.',
    price: 1050.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'clearblue-lenses',
  },
  {
    id: 'lens-single-vision-ultra-thin',
    name: 'Single Vision - Ultra Thin',
    description: 'Our thinnest and lightest lenses, ideal for high prescriptions.',
    price: 2250.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'clearblue-lenses',
  },
  {
    id: 'lens-single-vision-antifog',
    name: 'Single Vision - Antifog',
    description: 'Lenses with a special coating to prevent fogging in various conditions.',
    price: 3050.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'clearblue-lenses',
  },
  {
    id: 'lens-progressive-basic',
    name: 'Progressive - Basic',
    description: 'Seamless multifocal lenses for clear vision at all distances. Includes anti-glare coating.',
    price: 1150.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'photochromic-lenses',
  },
  {
    id: 'lens-progressive-premium',
    name: 'Progressive - Premium',
    description: 'Thinner and lighter progressive lenses for enhanced comfort and aesthetics.',
    price: 1700.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'photochromic-lenses',
  },
  {
    id: 'lens-progressive-ultra-premium',
    name: 'Progressive - Ultra Premium',
    description: 'Digitally surfaced progressive lenses for the widest and clearest viewing zones.',
    price: 2450.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'photochromic-lenses',
  },
  {
    id: 'lens-progressive-ultra-thin',
    name: 'Progressive - Ultra Thin',
    description: 'The thinnest progressive lenses available, perfect for strong prescriptions.',
    price: 4500.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'photochromic-lenses',
  },
  {
    id: 'lens-progressive-photochromic',
    name: 'Progressive - Photochromic',
    description: 'Progressive lenses that darken in sunlight and lighten indoors.',
    price: 2450.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'photochromic-lenses',
  },
  {
    id: 'lens-progressive-antifog',
    name: 'Progressive - Antifog',
    description: 'Progressive lenses with an anti-fog coating for clear vision in all conditions.',
    price: 6500.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'photochromic-lenses',
  },
  {
    id: 'lens-progressive-tinted-single',
    name: 'Progressive - Tinted Single',
    description: 'Progressive lenses with a single, uniform tint for sun protection and style.',
    price: 1650.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'polarized-pro-lenses',
  },
  {
    id: 'lens-progressive-tinted-double',
    name: 'Progressive - Tinted Double',
    description: 'Progressive lenses with a gradient tint, transitioning from a darker top to a lighter bottom.',
    price: 2050.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'polarized-pro-lenses',
  },
  {
    id: 'lens-bifocal-basic',
    name: 'Bifocal - Basic',
    description: 'Bifocal lenses with two distinct optical powers and an anti-glare coating.',
    price: 450.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'polarized-pro-lenses',
  },
  {
    id: 'lens-bifocal-premium',
    name: 'Bifocal - Premium',
    description: 'Thinner and lighter bifocal lenses for enhanced comfort.',
    price: 650.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'polarized-pro-lenses',
  },
  {
    id: 'lens-bifocal-ultra-premium',
    name: 'Bifocal - Ultra Premium',
    description: 'Digitally surfaced bifocal lenses for clearer vision.',
    price: 1050.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'polarized-pro-lenses',
  },
  {
    id: 'lens-bifocal-ultra-thin',
    name: 'Bifocal - Ultra Thin',
    description: 'The thinnest bifocal lenses available for strong prescriptions.',
    price: 2050.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'polarized-pro-lenses',
  },
  {
    id: 'lens-bifocal-tinted-single',
    name: 'Bifocal - Tinted Single',
    description: 'Bifocal lenses with a uniform tint for sun protection.',
    price: 850.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'polarized-pro-lenses',
  },
  {
    id: 'lens-bifocal-tinted-double',
    name: 'Bifocal - Tinted Double',
    description: 'Bifocal lenses with a gradient tint for style and function.',
    price: 1250.00,
    brand: 'Generic',
    type: 'Lenses',
    imageId: 'polarized-pro-lenses',
  },
];


const PRODUCTS_DATA: Product[] = [
  {
    id: '1',
    name: 'Classic Aviator',
    description: 'Timeless aviator style with a modern twist. Perfect for any occasion.',
    price: 150.00,
    brand: 'fastrack',
    type: 'Sunglasses',
    imageId: 'classic-aviator',
  },
  {
    id: '2',
    name: 'Wayfarer Ease',
    description: 'The iconic Wayfarer, redesigned for a lighter, more comfortable fit.',
    price: 165.00,
    brand: 'titan',
    type: 'Sunglasses',
    imageId: 'wayfarer-ease',
  },
  {
    id: '3',
    name: 'Holbrook Prizm',
    description: 'A timeless, classic design fused with modern Oakley technology. Prizm™ lenses enhance color and contrast.',
    price: 195.00,
    brand: 'Technoii',
    type: 'Sunglasses',
    imageId: 'holbrook-prizm',
  },
  {
    id: '4',
    name: '714 Steve McQueen',
    description: 'The legendary folding sunglasses, famously worn by the "King of Cool".',
    price: 480.00,
    brand: 'velocity',
    type: 'Sunglasses',
    imageId: '714-steve-mcqueen',
  },
  {
    id: '5',
    name: 'Urban Lite Frames',
    description: 'Sleek, minimalist frames crafted from lightweight titanium. Ideal for everyday wear.',
    price: 220.00,
    brand: 'X-Ford',
    type: 'Frames',
    imageId: 'urban-lite-frames',
  },
  {
    id: '6',
    name: 'Chic Cat-Eye',
    description: 'A bold, vintage-inspired cat-eye frame that makes a statement.',
    price: 310.00,
    brand: 'Lauredale Eyewear',
    type: 'Frames',
    imageId: 'chic-cat-eye',
  },
  {
    id: '7',
    name: 'Sport Performance',
    description: 'Aerodynamic frames designed for high-performance sports and active lifestyles.',
    price: 210.00,
    brand: 'titan',
    type: 'Frames',
    imageId: 'sport-performance-frames',
  },
  {
    id: '8',
    name: 'ClearBlue Lenses',
    description: 'Advanced lenses with blue light filtering technology to reduce eye strain from digital screens.',
    price: 120.00,
    brand: 'Technoii',
    type: 'Lenses',
    imageId: 'clearblue-lenses',
  },
    {
    id: '9',
    name: 'Photochromic Lenses',
    description: 'Lenses that automatically darken when exposed to sunlight, providing seamless vision indoors and out.',
    price: 180.00,
    brand: 'velocity',
    type: 'Lenses',
    imageId: 'photochromic-lenses',
  },
  {
    id: '10',
    name: 'Polarized Pro',
    description: 'Top-tier polarized lenses that cut glare and enhance clarity for unparalleled visual comfort.',
    price: 250.00,
    brand: 'X-Ford',
    type: 'Lenses',
    imageId: 'polarized-pro-lenses',
  },
  {
    id: '11',
    name: 'Retro Round',
    description: 'Iconic round metal frames that capture a vintage, intellectual vibe.',
    price: 175.00,
    brand: 'fastrack',
    type: 'Frames',
    imageId: 'retro-round-frames',
  },
  {
    id: '12',
    name: 'Minimalist Square',
    description: 'Clean lines and a sophisticated square shape define these modern frames.',
    price: 350.00,
    brand: 'Lauredale Eyewear',
    type: 'Frames',
    imageId: 'minimalist-square-frames',
  },
  {
    id: '13',
    name: 'Stealth Blade',
    description: 'Futuristic shield-style sunglasses for a bold, high-fashion statement.',
    price: 295.00,
    brand: 'NVG',
    type: 'Sunglasses',
    imageId: 'stealth-blade',
  },
  {
    id: '14',
    name: 'Titanium Hexa',
    description: 'Modern hexagonal frames made from ultra-lightweight and durable titanium.',
    price: 420.00,
    brand: 'titan',
    type: 'Frames',
    imageId: 'titanium-hexa',
  },
  {
    id: '15',
    name: 'Oceanic Round',
    description: 'Stylish round sunglasses with a cool blue tint, perfect for beach days.',
    price: 185.00,
    brand: 'NVG',
    type: 'Sunglasses',
    imageId: 'oceanic-round',
  }
];

// For backwards compatibility before caching was introduced
export const PRODUCTS = PRODUCTS_DATA;
export const LENS_TYPES = LENS_TYPES_DATA;
