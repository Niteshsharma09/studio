import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { StyleRecommendationForm } from '@/components/style-recommendation-form';

export default function StyleGuidePage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'style-guide-hero');

    return (
        <div>
            <section className="relative w-full h-[40vh] min-h-[250px] bg-secondary">
                {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                    priority
                />
                )}
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative h-full flex flex-col items-center justify-center text-center text-primary-foreground p-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">Find Your Perfect Pair</h1>
                    <p className="mt-4 max-w-2xl text-lg md:text-xl">Let our AI stylist help you discover frames that suit you best.</p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-16">
                <StyleRecommendationForm />
            </section>
        </div>
    );
}
