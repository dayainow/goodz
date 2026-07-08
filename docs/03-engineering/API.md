# Goodz API 명세

Base URL: `http://localhost:4000` (개발)

## 공통 타입

`@goodz/types`:

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
}

interface ProductListResponse {
  products: Product[];
  total: number;
}
```

## Endpoints

### `GET /health`

```json
{ "ok": true, "service": "goodz-api" }
```

### `GET /api/products`

**Response:** `ProductListResponse`

### `GET /api/products/:id`

**Response:** `Product`  
**404:** `{ "message": "Product not found" }`

## 향후 (P1+)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/cart` | 장바구니 담기 |
| GET | `/api/cart` | 장바구니 조회 |
| POST | `/api/checkout` | mock 결제 |

## 변경 절차

1. `packages/types` 수정
2. `apps/api-server` 구현
3. 프론트 fetch 갱신
4. 이 문서 + PRD AC 동기화
