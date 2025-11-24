export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  type: 'Frames' | 'Lenses' | 'Sunglasses';
  imageId: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
