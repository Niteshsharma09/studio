
import { Suspense } from 'react';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { HomePageContent } from '@/components/home-page';


// This is the parent component that will fetch data on the server
export default function Home() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <PageContent />
        </Suspense>
    )
}

// This new component fetches the data on the server side
async function PageContent() {
    const allProducts = await getProducts();
    // This client component uses the data but doesn't fetch it
    return <HomePageContent allProducts={allProducts} />;
}
