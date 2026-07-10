export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
}

export type ProductListResponse = {
  products: Product[];
  total: number;
};

export interface CreateProductRequest {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface CartLineItem {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface CartView {
  cart: Cart;
  lineItems: CartLineItem[];
  subtotal: number;
  itemCount: number;
}

export interface AddCartItemRequest {
  productId: string;
  quantity?: number;
}

export interface CheckoutRequest {
  cartId: string;
}

export interface CheckoutResult {
  orderId: string;
  total: number;
  status: "paid";
  items: CartLineItem[];
}

export type {
  ProcessApp,
  ProcessApproval,
  ProcessCheckItem,
  ProcessDeliverable,
  ProcessDeliverableType,
  ProcessIntake,
  ProcessItemStatus,
  ProcessPhase,
  ProcessSprint,
  ProcessStatus,
} from "./process.js";
