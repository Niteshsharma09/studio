
import Image from 'next/image';
import { StyleRecommendationForm } from '@/components/style-recommendation-form';

export default function StyleGuidePage() {
    const heroImageUrl = "https://images.unsplash.com/photo-1574494349420-ecf8ccbff974?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjaG9vc2luZyUyMGdsYXNzZXN8ZW58MHx8fHwxNzYzOTc1NjM5fDA&ixlib=rb-4.1.0&q=80&w=1920";

    return (
        <div>
            <section className="relative w-full h-[40vh] min-h-[250px] bg-secondary">
                <Image
                    src={heroImageUrl}
                    alt={"A person trying on different glasses."}
                    fill
                    className="object-cover"
                    data-ai-hint={"choosing glasses"}
                    priority
                />
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
