
"use client";

import { useState, useEffect, useCallback } from "react";
import { useFirestore } from "@/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import type { Review } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ReviewForm } from "./review-form";
import { Separator } from "./ui/separator";

interface ReviewListProps {
  productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const fetchReviews = useCallback(() => {
    if (!firestore) return;
    setLoading(true);
    const reviewsCol = collection(firestore, `products/${productId}/reviews`);
    const q = query(reviewsCol, orderBy("createdAt", "desc"), limit(20));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedReviews: Review[] = [];
      querySnapshot.forEach((doc) => {
        fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
      });
      setReviews(fetchedReviews);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [firestore, productId]);

  useEffect(() => {
    const unsubscribe = fetchReviews();
    return () => unsubscribe && unsubscribe();
  }, [fetchReviews]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Customer Reviews</h2>
            {loading && <div className="flex justify-center items-center h-40"><Loader2 className="h-10 w-10 animate-spin" /></div>}
            
            {!loading && reviews.length === 0 && (
                <Card className="flex flex-col items-center justify-center h-40 text-center">
                    <CardHeader>
                        <CardTitle>No Reviews Yet</CardTitle>
                        <CardDescription>Be the first to share your thoughts on this product.</CardDescription>
                    </CardHeader>
                </Card>
            )}

            {!loading && reviews.length > 0 && (
                <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={review.userImage} alt={review.userName} />
                            <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">{review.userName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {review.createdAt ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 my-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                        "h-4 w-4",
                                        i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-foreground/90">{review.comment}</p>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </div>

        <div className="lg:col-span-1">
            <div className="sticky top-24">
                <ReviewForm productId={productId} onReviewSubmit={fetchReviews} />
            </div>
        </div>
    </div>
  );
}
