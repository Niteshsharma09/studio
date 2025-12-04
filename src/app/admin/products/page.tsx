
import { getProducts } from '@/lib/data';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminProductsClientPage } from './client-page';


export default function AdminProductsPage() {
    return (
        <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>}>
            <ProductData />
        </Suspense>
    )
}

async function ProductData() {
    const products = await getProducts();
    return <AdminProductsClientPage products={products} />
}
