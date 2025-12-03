
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  type: 'Frames' | 'Lenses' | 'Sunglasses' | 'Contact Lenses';
  imageId: string;
  material?: string;
  color?: string;
  gender?: string;
  SKU?: string;
  createdAt?: number;
};

export type Frame = Product & {
  type: 'Frames';
  frameShape: string;
  size?: string;
  templeLength?: string;
  bridgeWidth?: string;
};

export type Sunglass = Product & {
  type: 'Sunglasses';
  lensColor: string;
  polarization?: boolean;
  UVProtection?: string;
};

export type Lens = Product & {
  type: 'Lenses';
  lensType?: string;
  coatings?: string;
  prescriptionRange?: string;
};

export type User = {
  id: string;
  email: string;
  createdAt: number;
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
};

export type Order = {
  id: string;
  userId: string;
  orderDate: any; // Firestore Timestamp
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  billingAddress?: string;
  items: OrderItem[];
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  productName: string;
  lensName: string | null;
};

export type Prescription = {
    file?: string | null;
    manual?: {
        left?: string;
        right?: string;
    };
};

export type CartItem = {
  product: Product;
  quantity: number;
  lens?: Product;
  prescription?: Prescription;
};

export type Review = {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    userImage?: string;
    rating: number;
    comment: string;
    imageUrl?: string;
    createdAt: any; // Firestore Timestamp
};
