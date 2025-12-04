
// This file is now deprecated in favor of using imageUrl directly on the product.
// It is kept for fallback purposes for any products that might not have an imageUrl yet.

import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
