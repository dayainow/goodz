# Goodz GA4 이벤트 명세 (기획)

> Notion에 동일 표를 만들고 export 하면 `ga-analytics-harness`로 검증 가능합니다.  
> 참고: [ga-analytics-harness](https://github.com/dayainow/ga-analytics-harness)

## 체크아웃 퍼널 (초안)

| event_name | trigger | component_name | parameters | page |
| --- | --- | --- | --- | --- |
| page_view | 상품 목록 진입 | ProductListPage | page_path, component_name | /products |
| product_card_click | 상품 카드 클릭 | ProductCard | page_path, component_name | /products |
| purchase_click | 결제 버튼 클릭 | CheckoutButton | page_path, component_name | /checkout |

## 워크플로우

1. Notion 표 작성 → Markdown export
2. `events.spec.yaml` 생성
3. `trackEvent` 구현 + MSW harness
4. Husky / GHA compliance

## 담당

- 기획: 이벤트 정의 (Notion SSOT)
- 개발: `apps/web-shop` trackEvent
- QA: `pnpm verify` + analytics harness
