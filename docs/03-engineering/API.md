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
| `approvals` | 스프린트·Gate·산출물의 DACI 승인 로그 |
| `traceLinks` | 기획·변경·산출물·승인과 Issue/PR/Commit/CI/Release/Smoke 증거 및 timestamp 연결 |
| `features` | 레퍼런스 기능 백로그 |
| `apps` | 로컬 앱·서비스 링크 |

### `GET /api/process/metrics-snapshots`

**Response:** `ProcessMetricSnapshotsFile` (`@goodz/types`)

Delivery Metrics 추세용 snapshot — `docs/00-process/metrics-snapshots.json`을 로드합니다.

**소비자:** `process-dashboard` (:5180) Metrics 메뉴

**주요 필드**

| 필드 | 설명 |
|------|------|
| `snapshots[].capturedAt` | snapshot 저장 시각 |
| `snapshots[].source` | 기준 systemVersion, status updatedAt, Git HEAD |
| `snapshots[].totals` | trace 수, linked/released 수, evidence issue 수 |
| `snapshots[].delivery` | lead time, CI success, change failure, smoke pass, trace coverage, evidence completeness |

### `GET /api/process/document`

**Query:** `path=docs/.../*.md`

**Response:** `ProcessDocumentResponse` (`@goodz/types`)

대시보드 안에서 Markdown 문서 원문을 확인하기 위한 읽기 전용 endpoint입니다. 보안상 `docs/` 아래 `.md` 파일만 읽습니다.

```json
{
  "path": "docs/00-process/USER_MANUAL.md",
  "title": "Goodz Process Dashboard 이용 매뉴얼",
  "content": "# Goodz Process Dashboard 이용 매뉴얼...",
  "updatedAt": "2026-07-13T02:30:00.000Z"
}
```

## 변경 절차

1. `packages/types` 수정
2. `apps/api-server` 구현
3. 프론트 fetch 갱신
4. 이 문서 + PRD AC 동기화
