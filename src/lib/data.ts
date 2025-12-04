import type { Product } from './types';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// This function now reliably fetches products from Firestore on the server-side.
// It initializes a temporary app instance to do so.
function getDb() {
    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    return getFirestore(app);
}

export async function getProducts(): Promise<Product[]> {
    console.log('Fetching products from Firestore...');
    try {
        const db = getDb();
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
        const db = getDb();
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
