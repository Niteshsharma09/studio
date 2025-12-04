
import type { Product } from './types';
import { unstable_cache as cache } from 'next/cache';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firestore-server';
import { PRODUCTS_DATA } from './constants';


export const getProducts = cache(
    async (): Promise<Product[]> => {
        console.log('Fetching products from Firestore...');
        try {
            const productsCollection = collection(db, 'products');
            const productSnapshot = await getDocs(productsCollection);
            const products: Product[] = productSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Product));

            if (products.length > 0) {
                return products;
            } else {
                // Fallback to local data if firestore is empty
                return PRODUCTS_DATA.map(p => ({
                    ...p,
                    imageUrls: p.imageUrl ? [p.imageUrl] : [],
                }));
            }
        } catch (error) {
            console.error("Failed to fetch products from Firestore:", error);
            // Fallback to local data if Firestore fails
            return PRODUCTS_DATA.map(p => ({
                ...p,
                imageUrls: p.imageUrl ? [p.imageUrl] : [],
            }));
        }
    },
    ['products'],
    { revalidate: 60 } // Revalidate every minute
);

export const getLenses = cache(
    async () => {
        console.log('Fetching lenses...');
        const products = await getProducts();
        const recentLensNames = ["ClearBlue Lenses", "Photochromic Lenses", "Technoii Drive Lens"];
        return products.filter(p => p.type === 'Lenses' && recentLensNames.includes(p.name));
    },
    ['lenses'],
    { revalidate: 3600 } // Revalidate every hour
);


export const getProduct = cache(
    async (id: string) => {
        const products = await getProducts();
        console.log(`Fetching product ${id}...`);
        return products.find(p => p.id === id);
    },
    ['product'],
    { revalidate: 60 }
);
