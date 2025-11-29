"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { CartItem, Product } from '@/lib/types';

interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Product, quantity: number, lens?: Product) => void;
  removeItem: (productId: string, lensId?: string) => void;
  updateQuantity: (productId: string, quantity: number, lensId?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, quantity: number, lens?: Product) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id && item.lens?.id === lens?.id);

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        return [...prevItems, { product, quantity, lens }];
      }
    });
  };

  const removeItem = (productId: string, lensId?: string) => {
    setCartItems(prevItems => prevItems.filter(item => !(item.product.id === productId && item.lens?.id === lensId)));
  };

  const updateQuantity = (productId: string, quantity: number, lensId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, lensId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          (item.product.id === productId && item.lens?.id === lensId) ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const itemPrice = item.product.price + (item.lens?.price ?? 0);
    return total + itemPrice * item.quantity;
  }, 0);
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addItem, removeItem, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
