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
