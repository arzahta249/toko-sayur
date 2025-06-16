export type MenuType = {
  id: string;
  slug: string;
  title: string;
  desc?: string;
  img?: string;
  color: string;
}[];

export type ProductType = {
  id: string;
  title: string;
  desc?: string;
  img?: string;
  price: number;
  stock: number;
  options?: { title: string; additionalPrice: number }[];
};

export type OrderType = {
  id: string;
  userEmail: string; // cukup ini untuk email
  price: number;
  products: CartItemType[];
  status: string;
  createdAt: Date;
  order_id?: string; // sudah ganti dari intent_id
  address?: string;
  phone?: string;

  name?: string;
};



export type CartItemType = {
  id: string;
  title: string;
  img?: string;
  price: number;
  stock: number;
  optionTitle?: string;
  quantity: number;
};

export type CartType = {
  products: CartItemType[];
  totalItems: number;
  totalPrice: number;
};

export type ActionTypes = {
  addToCart:(item:CartItemType)=> void;
  removeFromCart:(item:CartItemType)=> void;
  clearCart: () => void;
}
