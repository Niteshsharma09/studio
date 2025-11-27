export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  type: 'Frames' | 'Lenses' | 'Sunglasses';
  imageId: string;
};

export type Lens = Product & { type: 'Lenses' };

export type CartItem = {
  product: Product;
  quantity: number;
  lens?: Lens;
};
