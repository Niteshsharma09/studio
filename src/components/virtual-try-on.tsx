
"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { virtualTryOn } from "@/ai/flows/virtual-try-on";
import { convertImageToBase64 } from "@/lib/actions";
import type { Product } from "@/lib/types";
import Image from "next/image";
import { Loader2, Camera } from "lucide-react";

interface VirtualTryOnProps {
  children: ReactNode;
  product: Product;
}

export function VirtualTryOn({ children, product }: VirtualTryOnProps) {
  const [open, setOpen] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!userImage) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload a photo of yourself.",
      });
      return;
    }

    setIsLoading(true);
    setResultImage(null);

    try {
      const productImageUrl = product.imageUrl;
      if (!productImageUrl) throw new Error("Product image not found.");

      const [glassesDataUri, photoDataUri] = await Promise.all([
        convertImageToBase64(productImageUrl),
        Promise.resolve(userImage) // userImage is already a data URI
      ]);

      const result = await virtualTryOn({ glassesDataUri, photoDataUri });

      if (result.virtualTryOnImage) {
        setResultImage(result.virtualTryOnImage);
      } else {
        throw new Error("The AI could not generate an image.");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Virtual Try-On Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Virtual Try-On</DialogTitle>
          <DialogDescription>
            See how the {product.name} looks on you. Upload a clear, front-facing photo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="relative aspect-square w-full rounded-md border-2 border-dashed flex items-center justify-center text-muted-foreground bg-muted/50">
            {resultImage ? (
                <Image src={resultImage} alt="Virtual try-on result" fill className="object-contain rounded-md" />
            ) : userImage ? (
                <Image src={userImage} alt="Your photo" fill className="object-contain rounded-md" />
            ) : (
                <div className="text-center">
                    <Camera className="mx-auto h-12 w-12" />
                    <p>Your photo will appear here</p>
                </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 font-medium">Placing glasses...</p>
              </div>
            )}
          </div>
          
          <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleTryOn} disabled={isLoading || !userImage}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Try On
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
