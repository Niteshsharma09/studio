

import { getLenses, getProduct, getProducts } from '@/lib/data';
import { ProductDetailClientPage } from './client-page';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>}>
        <ProductData product={product} />
    </Suspense>
  )
}

async function ProductData({ product }: { product: any }) {
    const allProducts = await getProducts();
    const lenses = await getLenses();

    return (
        <ProductDetailClientPage product={product} allProducts={allProducts} lenses={lenses} />
    )
}
