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

**주요 필드**

| 필드 | 설명 |
|------|------|
| `sprint` | 현재 스프린트와 목표 |
| `phases` | P0–P4 Gate와 체크 항목 |
| `intakes` | 기획 입력함 항목 |
| `planningChanges` | 기획 수정 요청·승인·반영 로그 |
| `deliverables` | PRD·화면설계·API·QA·릴리스 산출물 레지스트리 |
| `approvals` | 스프린트·Gate·산출물 승인 로그 |
| `traceLinks` | 기획·변경·산출물·승인과 Issue/PR/Commit/CI/Release 증거 연결 |
| `features` | 레퍼런스 기능 백로그 |
| `apps` | 로컬 앱·서비스 링크 |

## 변경 절차

1. `packages/types` 수정
2. `apps/api-server` 구현
3. 프론트 fetch 갱신
4. 이 문서 + PRD AC 동기화
