# Goodz API 명세

Base URL: `http://localhost:4000` (개발)

## 공통 타입

`@goodz/types` — `Product`, `ProductListResponse`, `CreateProductRequest`, `Cart`, `CartView`, `CheckoutResult`

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

### `POST /api/products`

**Body:** `CreateProductRequest`

```json
{
  "name": "굿즈 머그컵",
  "price": 19900,
  "description": "세라믹 머그컵 350ml",
  "imageUrl": "/images/mug.png",
  "category": "living",
  "stock": 40
}
```

**Response:** `201` + `Product` (id는 `gd-004` 형식으로 자동 생성)  
**400:** `{ "message": "..." }`

### `GET /api/cart`

**Query:** `cartId` 또는 헤더 `x-cart-id`

**Response:** `CartView`

### `POST /api/cart/items`

**Headers:** `x-cart-id` (선택 — 없으면 새 장바구니 생성)

**Body:**

```json
{ "productId": "gd-001", "quantity": 1 }
```

**Response:** `CartView`

### `POST /api/checkout`

**Body:**

```json
{ "cartId": "uuid" }
```

**Response:** `CheckoutResult`

```json
{
  "orderId": "ord-123",
  "total": 23800,
  "status": "paid",
  "items": []
}
```

### `GET /api/process/status`

**Response:** `ProcessStatus` (`@goodz/types`)

풀 프로세스 진행도 SSOT — `docs/00-process/status.json`을 로드합니다.

**소비자:** `process-dashboard` (:5180)

## 변경 절차

1. `packages/types` 수정
2. `apps/api-server` 구현
3. 프론트 fetch 갱신
4. 이 문서 + PRD AC 동기화
