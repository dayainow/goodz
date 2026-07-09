# 화면 스펙 — 장바구니

| 항목 | 값 |
|------|-----|
| 화면 ID | SCR-WEB-003 |
| 경로 | `/cart` |
| Claude Design | TBD |

## 구성

- 헤더: "장바구니", 상품 수
- 아이템 리스트: 이름, 단가, 수량, 소계
- 합계 영역: 총 금액
- CTA: 결제하기 → `/checkout`
- 빈 상태: "장바구니가 비어 있습니다" + 쇼핑 계속하기

## 데이터

- API: `GET /api/cart` (헤더 `x-cart-id`)
- 타입: `CartView` (`@goodz/types`)

## 구현 상태

- [x] API 연동
- [x] Sticky Lemon 톤 UI (라인아이템 · 요약 · empty state)
