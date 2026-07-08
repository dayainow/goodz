# 화면 스펙 — 상품 목록

| 항목 | 값 |
|------|-----|
| 화면 ID | SCR-WEB-001 |
| 경로 | `/` (web-shop) |
| Claude Design | TBD |

## 구성

- 헤더: 로고, 장바구니 CTA (`@goodz/ui` Button)
- 상품 그리드: 카드 3열 (desktop) / 1열 (mobile)
- 카드: 카테고리, 이름, 설명, 가격, 재고

## 데이터

- API: `GET /api/products`
- 타입: `ProductListResponse` (`@goodz/types`)

## 인터랙션

| 동작 | GA4 (예정) |
|------|------------|
| 페이지 진입 | `page_view` |
| 카드 클릭 | `product_card_click` |

## 구현 상태

- [x] API 연동
- [x] ProductGrid + 카드 클릭
