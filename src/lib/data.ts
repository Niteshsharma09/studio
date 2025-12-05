
import type { Product } from './types';
import { collection, getDocs, doc, getDoc, query } from 'firebase/firestore';
import { initializeApp, getApps, cert, App as AdminApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseAdminConfig } from '@/firebase/config-server';

// This function now correctly handles Firebase Admin SDK initialization,
// ensuring it only runs once per server instance.
async function getDb() {
    const apps = getApps();
    let adminApp: AdminApp;

    if (apps.length > 0) {
        adminApp = apps[0];
    } else {
        // Initialize the app with the credentials from the server config
        adminApp = initializeApp({
            credential: cert(firebaseAdminConfig.credential),
        });
    }

    return getFirestore(adminApp);
}

export async function getProducts(): Promise<Product[]> {
    console.log('Fetching products from Firestore...');
    try {
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
    return products.filter(p => p.type === 'Lenses');
}
