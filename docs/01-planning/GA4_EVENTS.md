# Goodz GA4 이벤트 명세 (기획)

> SSOT: `apps/web-shop/events.spec.yaml`  
> 검증: `pnpm --filter @goodz/web-shop test:analytics`  
> 참고: [ga-analytics-harness](https://github.com/dayainow/ga-analytics-harness)

## MVP 쇼핑 퍼널

| event_name | trigger | component_name | page |
| --- | --- | --- | --- |
| page_view | 상품 목록 진입 | ProductListPage | `/` |
| product_card_click | 상품 카드 클릭 | ProductCard | `/` |
| page_view | 상품 상세 진입 | ProductDetailPage | `/products/[id]` |
| add_to_cart_click | 장바구니 담기 | AddToCartButton | `/products/[id]` |
| page_view | 장바구니 진입 | CartPage | `/cart` |
| proceed_to_checkout_click | 결제하기 이동 | ProceedToCheckoutButton | `/cart` |
| page_view | 체크아웃 진입 | CheckoutPage | `/checkout` |
| purchase_click | 결제 버튼 클릭 | CheckoutButton | `/checkout` |
| page_view | 결제 성공 | CheckoutSuccessPage | `/checkout/success` |

## 워크플로우

1. 기획 표 작성 (`GA4_EVENTS.md` 또는 Notion)
2. `events.spec.yaml` 동기화
3. `trackEvent` 구현 (`apps/web-shop/src`)
4. MSW harness + compliance (`test:analytics`)

```bash
cd goodz
pnpm --filter @goodz/web-shop test:analytics
pnpm --filter @goodz/web-shop analytics:compliance
```

## 담당

- 기획: 이벤트 정의
- 개발: `apps/web-shop` trackEvent
- QA: harness + `pnpm verify`
