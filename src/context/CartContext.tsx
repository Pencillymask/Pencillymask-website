import React, { createContext, useContext, useState, useEffect } from 'react';
import { Artwork } from '../types/database.types';

interface CartContextType {
  items: Artwork[];
  addToCart: (artwork: Artwork) => boolean;
  removeFromCart: (artworkId: string) => void;
  clearCart: () => void;
  isInCart: (artworkId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dhruvi_portfolio_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Artwork[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (artwork: Artwork): boolean => {
    // 1. Prevent sold or non-available artwork from being added
    if (artwork.status !== 'available') {
      alert('This original painting is currently sold or reserved.');
      return false;
    }

    // 2. Prevent duplicate additions (each original piece is quantity 1)
    if (items.some(item => item.id === artwork.id)) {
      setIsCartOpen(true);
      return true;
    }

    setItems(prev => [...prev, artwork]);
    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (artworkId: string) => {
    setItems(prev => prev.filter(item => item.id !== artworkId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (artworkId: string) => {
    return items.some(item => item.id === artworkId);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
