
import type { Product } from './types';
import { unstable_cache as cache } from 'next/cache';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firestore-server';

// This function now reliably fetches products from Firestore on the server-side.
export const getProducts = cache(async (): Promise<Product[]> => {
    console.log('Fetching products from Firestore...');
    try {
        if (!db) {
            console.error("Firestore is not initialized. Cannot fetch products. Check server logs for Firebase Admin SDK initialization errors.");
            return [];
        }
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        
        if (productSnapshot.empty) {
            console.log("No products found in the 'products' collection.");
            return [];
        }

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
}, ['products'], { revalidate: 1 }); // Revalidate every 1 second to show new products

export const getProduct = cache(
    async (id: string): Promise<Product | undefined> => {
        try {
            if (!db) {
                console.error("Firestore is not initialized. Cannot fetch product.");
                return undefined;
            }
            console.log(`Fetching product ${id} from Firestore...`);
            const productDoc = await getDoc(doc(db, 'products', id));

            if (!productDoc.exists()) {
                console.warn(`Product with id ${id} not found.`);
                return undefined;
            }

            return { id: productDoc.id, ...productDoc.data() } as Product;
        } catch (error) {
            console.error(`Failed to fetch product ${id}:`, error);
            return undefined;
        }
    },
    ['product', 'id'],
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
