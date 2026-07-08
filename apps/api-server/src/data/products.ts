import type { Product, ProductListResponse } from "@goodz/types";

export const mockProducts: Product[] = [
  {
    id: "gd-001",
    name: "굿즈 스티커 팩",
    price: 8900,
    description: "데일리 굿즈 스티커 12종 세트",
    imageUrl: "/images/sticker-pack.png",
    category: "stationery",
    stock: 120,
  },
  {
    id: "gd-002",
    name: "캐릭터 아크릴 키링",
    price: 14900,
    description: "양면 아크릭 키링 — 랜덤 1종",
    imageUrl: "/images/keyring.png",
    category: "accessory",
    stock: 58,
  },
  {
    id: "gd-003",
    name: "한정판 텀블러",
    price: 28900,
    description: "500ml 보온·보냉 텀블러",
    imageUrl: "/images/tumbler.png",
    category: "living",
    stock: 24,
  },
];

export function listProducts(): ProductListResponse {
  return {
    products: mockProducts,
    total: mockProducts.length,
  };
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}
