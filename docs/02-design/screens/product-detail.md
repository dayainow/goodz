# 화면 스펙 — 상품 상세

| 항목 | 값 |
|------|-----|
| 화면 ID | SCR-WEB-002 |
| 경로 | `/products/[id]` |
| Claude Design | TBD |

## 구성

- 뒤로가기 링크 → `/`
- 상품 정보: 카테고리, 이름, 설명, 가격, 재고
- CTA: 장바구니 담기 (`@goodz/ui` Button primary)
- 보조 CTA: 목록으로

## 데이터

- API: `GET /api/products/:id`
- 타입: `Product` (`@goodz/types`)

## 인터랙션

| 동작 | 결과 |
|------|------|
| 장바구니 담기 | `POST /api/cart/items` → `/cart` 이동 (선택) |
| 404 | "상품을 찾을 수 없습니다" |

## 구현 상태

- [x] API 연동
- [x] AddToCartButton
