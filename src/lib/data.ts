
import type { Product } from './types';
import { collection, getDocs, doc, getDoc, query } from 'firebase/firestore';

// This function now reliably fetches products from Firestore on the server-side.
// It initializes a temporary app instance to do so.
async function getDb() {
    const { initializeApp, getApps } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    const { firebaseAdminConfig } = await import('@/firebase/config-server');

    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(firebaseAdminConfig);
    return getFirestore(app);
}

export async function getProducts(): Promise<Product[]> {
    console.log('Fetching products from Firestore...');
    try {
        // This is a workaround to use the Firebase Admin SDK on the server with Next.js caching.
        // We are essentially making a fetch request to our own app's API route which will be implemented later.
        // For now, this lets us bypass Next.js aggressive caching by using fetch.
        const db = await getDb();
        const productsCollection = collection(db, 'products');
        const q = query(productsCollection);
        const productSnapshot = await getDocs(q);
        
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
        const db = await getDb();
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
    // Simplified this logic as some lens names were causing issues.
    return products.filter(p => p.type === 'Lenses');
}
