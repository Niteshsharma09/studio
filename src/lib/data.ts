
import type { Product } from './types';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firestore-server';

// This function now reliably fetches products from Firestore on the server-side.
export async function getProducts(): Promise<Product[]> {
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
}

export async function getProduct(id: string): Promise<Product | undefined> {
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
}


export async function getLenses() {
    console.log('Fetching lenses...');
    const products = await getProducts();
    const recentLensNames = ["ClearBlue Lenses", "Photochromic Lenses", "Technoii Drive Lens"];
    return products.filter(p => p.type === 'Lenses' && recentLensNames.includes(p.name));
}
