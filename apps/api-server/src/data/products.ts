import type { CreateProductRequest, Product, ProductListResponse } from "@goodz/types";

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

function nextProductId(): string {
  const max = mockProducts.reduce((acc, product) => {
    const match = /^gd-(\d+)$/.exec(product.id);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);

  return `gd-${String(max + 1).padStart(3, "0")}`;
}

export function createProduct(input: CreateProductRequest): Product {
  const name = input.name?.trim();
  if (!name) {
    throw new Error("name is required");
  }

  if (!Number.isFinite(input.price) || input.price <= 0) {
    throw new Error("price must be greater than 0");
  }

  if (!Number.isInteger(input.stock) || input.stock < 0) {
    throw new Error("stock must be a non-negative integer");
  }

  const category = input.category?.trim();
  if (!category) {
    throw new Error("category is required");
  }

  const product: Product = {
    id: nextProductId(),
    name,
    price: input.price,
    description: input.description?.trim() ?? "",
    imageUrl: input.imageUrl?.trim() || "/images/placeholder.png",
    category,
    stock: input.stock,
  };

  mockProducts.push(product);
  return product;
}
