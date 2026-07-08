# 화면 스펙 — 체크아웃

| 항목 | 값 |
|------|-----|
| 화면 ID | SCR-WEB-004 |
| 경로 | `/checkout` |
| Figma | TBD |

## 구성

- 주문 요약: 상품 목록, 총액
- 배송 정보 폼 (mock): 이름, 연락처 — 읽기 전용 placeholder
- CTA: 결제하기 (mock)
- 완료 후: `/checkout/success?orderId=...`

## 데이터

- API: `POST /api/checkout` body `{ cartId }`
- Response: `CheckoutResult` — `orderId`, `total`, `status: "paid"`

## GA4 (예정)

| event_name | trigger |
|------------|---------|
| purchase_click | 결제 버튼 클릭 |

## 구현 상태

- [x] mock 결제 API
- [x] 성공 페이지
