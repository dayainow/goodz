# Claude Design — 12화면 인덱스

> 프로젝트: [Goodz — Web Shop MVP](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9)  
> 레퍼런스: [Sticky Lemon](https://www.stickylemon.nl/) · CTA `#7C3AED`  
> 검증: 2026-07-09 — Claude Code 업로드 완료 · 사용자 미리보기 확인 대기

## 쇼핑몰 (375px)

| # | 화면 | 라우트 | Claude Design | 스펙 |
|---|------|--------|---------------|------|
| 1 | Home | `/` | [home](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=home.dc.html) | [home.md](./home.md) |
| 2 | Shop | `/shop` | [shop](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=shop.dc.html) | [shop.md](./shop.md) |
| 3 | Category | `/shop/accessory` | [category](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=category-accessory.dc.html) | [category.md](./category.md) |
| 4 | Product Detail | `/products/[id]` | [detail](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=product-detail.dc.html) | [product-detail.md](./product-detail.md) |
| 5 | Cart | `/cart` | [cart](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=cart.dc.html) | [cart.md](./cart.md) |
| 6 | Cart Empty | `/cart` (empty) | [empty](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=cart-empty.dc.html) | [cart-empty.md](./cart-empty.md) |
| 7 | Checkout | `/checkout` | [checkout](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=checkout.dc.html) | [checkout.md](./checkout.md) |
| 8 | Order Success | `/checkout/success` | [success](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=order-success.dc.html) | [order-success.md](./order-success.md) |
| 9 | Search | `/search` | [search](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=search.dc.html) | [search.md](./search.md) |
| 10 | About | `/about` | [about](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=about.dc.html) | [about.md](./about.md) |

## 어드민 (1280px)

| # | 화면 | Claude Design | 스펙 |
|---|------|---------------|------|
| A1 | 상품 목록 | [admin-list](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=admin-product-list.dc.html) | [admin-product-list.md](./admin-product-list.md) |
| A2 | 상품 등록 | [admin-create](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=admin-product-create.dc.html) | [admin-product-create.md](./admin-product-create.md) |

## 네비게이션 플로우 (검증용)

```text
Home → Shop → Category → Detail → Cart → Checkout → Success
  ↘ Search    Cart Empty (별도 프레임)
  ↘ About
Admin List ↔ Admin Create
```

## 미리보기 확인 체크리스트

- [ ] 12화면 레이아웃 깨짐 없음
- [ ] 홈→상세→장바구니→체크아웃 클릭 이동
- [ ] violet CTA + 파스텔 카테고리 톤
- [ ] 상품 8종 표시 (검색·카테고리·샵)

> 이전 4화면 스펙: [product-list.md](./product-list.md) — `/`는 Home으로, 목록은 `/shop`으로 분리 예정 (P2 handoff)
