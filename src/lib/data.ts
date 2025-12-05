
import type { Product } from './types';
import { collection, getDocs, doc, getDoc, query, Timestamp } from 'firebase/firestore';
import { initializeApp, getApps, cert, App as AdminApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseAdminConfig } from '@/firebase/config-server';

// Helper function to safely transform Firestore Timestamps.
const transformTimestamp = (timestamp: any): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  // If it's already a string or other primitive, return as is.
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp).toISOString();
  }
  // Fallback for unexpected types
  return new Date().toISOString();
};


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
        // Use fetch with 'no-store' to prevent caching on the server
        const productsCollection = await db.collection('products').get();

        if (productsCollection.empty) {
            console.log("No products found in the 'products' collection.");
            return [];
        }

        const products: Product[] = productsCollection.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Transform timestamp to a serializable format
                createdAt: data.createdAt ? transformTimestamp(data.createdAt) : undefined,
            } as Product;
        });

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
        const productDoc = await db.collection('products').doc(id).get();

        if (!productDoc.exists) {
            console.warn(`Product with id ${id} not found.`);
            return undefined;
        }

        const data = productDoc.data();
        if (!data) return undefined;

        return { 
            id: productDoc.id, 
            ...data,
            // Transform timestamp to a serializable format
            createdAt: data.createdAt ? transformTimestamp(data.createdAt) : undefined,
        } as Product;
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
