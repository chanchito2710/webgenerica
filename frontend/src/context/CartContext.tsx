import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { cartService } from '../services/cart.service';
import { useAuth } from './AuthContext';
import type { CartItem } from '../types';

interface LocalCartItem {
  productId: number;
  variantId?: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  localItems: LocalCartItem[];
  resolvedItems: CartItem[];
  loading: boolean;
  totalItems: number;
  addToCart: (productId: number, quantity?: number, variantId?: number) => Promise<void>;
  updateQuantity: (idOrIndex: number, quantity: number) => Promise<void>;
  removeItem: (idOrIndex: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

const LOCAL_CART_KEY = 'guest_cart';

function getLocalCart(): LocalCartItem[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [localItems, setLocalItems] = useState<LocalCartItem[]>(getLocalCart());
  const [resolvedItems, setResolvedItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const resolveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const resolveLocal = useCallback(async (locals: LocalCartItem[]) => {
    if (locals.length === 0) {
      setResolvedItems([]);
      return;
    }
    try {
      const data = await cartService.resolveGuestCart(locals);
      setResolvedItems(data);
    } catch {
      setResolvedItems([]);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      const locals = getLocalCart();
      setLocalItems(locals);
      await resolveLocal(locals);
      return;
    }
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, resolveLocal]);

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setItems([]);
      const locals = getLocalCart();
      setLocalItems(locals);
      resolveLocal(locals);
    }
  }, [user, refreshCart, resolveLocal]);

  useEffect(() => {
    if (user) return;
    clearTimeout(resolveTimeout.current);
    resolveTimeout.current = setTimeout(() => resolveLocal(localItems), 300);
    return () => clearTimeout(resolveTimeout.current);
  }, [localItems, user, resolveLocal]);

  const effectiveItems = user ? items : resolvedItems;
  const totalItems = user
    ? items.reduce((sum, i) => sum + i.quantity, 0)
    : localItems.reduce((sum, i) => sum + i.quantity, 0);

  const addToCart = async (productId: number, quantity = 1, variantId?: number) => {
    if (user) {
      await cartService.addToCart(productId, quantity, variantId);
      await refreshCart();
    } else {
      const updated = [...localItems];
      const idx = updated.findIndex((i) => i.productId === productId && i.variantId === variantId);
      if (idx >= 0) {
        updated[idx].quantity += quantity;
      } else {
        updated.push({ productId, variantId, quantity });
      }
      setLocalItems(updated);
      saveLocalCart(updated);
    }
  };

  const updateQuantity = async (idOrIndex: number, quantity: number) => {
    if (user) {
      if (quantity <= 0) {
        await cartService.removeFromCart(idOrIndex);
      } else {
        await cartService.updateCartItem(idOrIndex, quantity);
      }
      await refreshCart();
    } else {
      const updated = [...localItems];
      if (quantity <= 0) {
        updated.splice(idOrIndex, 1);
      } else {
        updated[idOrIndex].quantity = quantity;
      }
      setLocalItems(updated);
      saveLocalCart(updated);
    }
  };

  const removeItem = async (idOrIndex: number) => {
    if (user) {
      await cartService.removeFromCart(idOrIndex);
      await refreshCart();
    } else {
      const updated = [...localItems];
      updated.splice(idOrIndex, 1);
      setLocalItems(updated);
      saveLocalCart(updated);
    }
  };

  const clearCart = async () => {
    if (user) {
      await cartService.clearCart();
      setItems([]);
    } else {
      setLocalItems([]);
      saveLocalCart([]);
      setResolvedItems([]);
    }
  };

  return (
    <CartContext.Provider value={{ items: effectiveItems, localItems, resolvedItems, loading, totalItems, addToCart, updateQuantity, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
