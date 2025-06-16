import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Product {
  id: string;
  title: string;
  price: number;
  img?: string;
  quantity: number;
  optionTitle?: string;
}

interface CartType {
  products: Product[];
  totalItems: number;
  totalPrice: number;
}

interface ActionTypes {
  addToCart: (item: Product) => void;
  removeFromCart: (item: Product) => void;
  clearCart: () => void;
  increaseQuantity: (item: Product) => void;
  decreaseQuantity: (item: Product) => void;
}

export const useCartStore = create<CartType & ActionTypes>()(
  persist(
    (set, get) => ({
      products: [],
      totalItems: 0,
      totalPrice: 0,

      addToCart: (item) => {
        const products = get().products;
        const existing = products.find((p) => p.id === item.id);
        let newProducts;

        if (existing) {
          newProducts = products.map((p) =>
            p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p
          );
        } else {
          newProducts = [...products, item];
        }

        const newTotalItems = newProducts.reduce((acc, item) => acc + item.quantity, 0);
        const newTotalPrice = newProducts.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );

        set({ products: newProducts, totalItems: newTotalItems, totalPrice: newTotalPrice });
      },

      removeFromCart: (item) => {
        const newProducts = get().products.filter((p) => p.id !== item.id);
        const newTotalItems = newProducts.reduce((acc, item) => acc + item.quantity, 0);
        const newTotalPrice = newProducts.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        set({ products: newProducts, totalItems: newTotalItems, totalPrice: newTotalPrice });
      },

      clearCart: () => {
        set({ products: [], totalItems: 0, totalPrice: 0 });
      },

      increaseQuantity: (item) => {
        const products = get().products.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
        const totalItems = products.reduce((acc, item) => acc + item.quantity, 0);
        const totalPrice = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
        set({ products, totalItems, totalPrice });
      },

      decreaseQuantity: (item) => {
        const products = get().products
          .map((p) =>
            p.id === item.id
              ? { ...p, quantity: Math.max(1, p.quantity - 1) }
              : p
          )
          .filter((p) => p.quantity > 0);
        const totalItems = products.reduce((acc, item) => acc + item.quantity, 0);
        const totalPrice = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
        set({ products, totalItems, totalPrice });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
