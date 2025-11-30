
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters long."),
  image: z.any().optional(),
});

interface ReviewFormProps {
  productId: string;
  onReviewSubmit: () => void;
}

export function ReviewForm({ productId, onReviewSubmit }: ReviewFormProps) {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });
  const selectedRating = form.watch("rating");

  if (userLoading) {
    return <Loader2 className="animate-spin" />;
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Write a Review</CardTitle>
            <CardDescription>You must be logged in to write a review.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild><Link href="/login">Log In to Review</Link></Button>
        </CardContent>
      </Card>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof reviewSchema>) => {
    if (!firestore || !user) return;
    setIsLoading(true);

    try {
        let imageUrl: string | undefined = undefined;

        // Upload image if present
        if (values.image) {
            const storage = getStorage();
            const imageRef = ref(storage, `reviews/${productId}/${user.uid}-${Date.now()}`);
            const snapshot = await uploadString(imageRef, values.image, 'data_url');
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const reviewsCol = collection(firestore, `products/${productId}/reviews`);
        await addDoc(reviewsCol, {
            productId,
            userId: user.uid,
            userName: user.displayName || user.email || "Anonymous",
            userImage: user.photoURL,
            rating: values.rating,
            comment: values.comment,
            imageUrl: imageUrl,
            createdAt: serverTimestamp(),
        });
        
        toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
        form.reset();
        setFileName("");
        onReviewSubmit();
    } catch (error) {
        console.error("Review submission error:", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "Could not submit your review. Please try again."
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Your Rating</FormLabel>
                    <FormControl>
                        <div 
                            className="flex items-center gap-1"
                            onMouseLeave={() => setHoverRating(0)}
                        >
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                            key={star}
                            className={cn(
                                "h-8 w-8 cursor-pointer transition-colors",
                                (hoverRating >= star || selectedRating >= star)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            )}
                            onMouseEnter={() => setHoverRating(star)}
                            onClick={() => field.onChange(star)}
                            />
                        ))}
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Your Comment</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Share your thoughts on the product..." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormItem>
                    <FormLabel>Upload a Photo (Optional)</FormLabel>
                    <div className="flex items-center gap-2">
                        <Input id="review-image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <Button type="button" variant="outline" onClick={() => document.getElementById('review-image')?.click()}>
                            Choose File
                        </Button>
                        <span className="text-sm text-muted-foreground truncate">{fileName || "No file chosen"}</span>
                    </div>
                </FormItem>

                <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
