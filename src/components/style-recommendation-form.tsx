"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStyleRecommendation, type StyleRecommendationOutput } from '@/ai/flows/get-style-recommendation';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  faceShape: z.string().min(1, "Please select your face shape."),
  stylePreference: z.string().min(1, "Please select your style preference."),
  additionalDetails: z.string().optional(),
});

const faceShapes = ["Round", "Oval", "Square", "Heart", "Diamond"];
const stylePreferences = ["Modern", "Classic", "Retro", "Minimalist", "Sporty"];

export function StyleRecommendationForm() {
  const [recommendation, setRecommendation] = useState<StyleRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faceShape: "",
      stylePreference: "",
      additionalDetails: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendation(null);
    try {
        const result = await getStyleRecommendation(values);
        setRecommendation(result);
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Recommendation Failed",
            description: "Could not get a style recommendation at this time. Please try again later."
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <Card>
        <CardHeader>
            <CardTitle>Describe Your Style</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="faceShape"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Face Shape</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your face shape" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {faceShapes.map(shape => <SelectItem key={shape} value={shape}>{shape}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Not sure? Look in a mirror and trace your face shape.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="stylePreference"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Style Preference</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your preferred style" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {stylePreferences.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="additionalDetails"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Additional Details (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="e.g., I prefer lightweight materials, I need them for work, I like bold colors..."
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Get Recommendation
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center min-h-[400px]">
        {isLoading ? (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="font-medium text-lg">Our AI is styling your look...</p>
            </div>
        ) : recommendation ? (
            <Card className="w-full bg-secondary">
                <CardHeader>
                    <CardTitle>Your Style Recommendation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Recommended Styles</h3>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            {recommendation.recommendedStyles.map((style, i) => <li key={i}>{style}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Why these styles?</h3>
                        <p className="mt-2 text-foreground/80">{recommendation.reasoning}</p>
                    </div>
                </CardContent>
            </Card>
        ) : (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg w-full">
                <Wand2 className="mx-auto h-16 w-16" />
                <p className="mt-4 font-medium text-lg">Your recommendation will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
}
