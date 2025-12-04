
import type { Product } from './types';
import { unstable_cache as cache } from 'next/cache';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firestore-server';
import { PRODUCTS_DATA } from './constants';


export const getProducts = async (): Promise<Product[]> => {
    console.log('Fetching products from Firestore...');
    try {
        if (!db) {
            console.warn("Firestore is not initialized. Cannot fetch products.");
            return [];
        }
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const products: Product[] = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));

        return products;

    } catch (error) {
        console.error("Failed to fetch products from Firestore:", error);
        // In case of an error, return an empty array to prevent crashes.
        return [];
    }
};

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
