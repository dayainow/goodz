# Goodz 디자인 시스템

## 컬러 (Tailwind 토큰)

정의: `packages/ui/tailwind.config.ts` → 앱에서 `presets: [goodzPreset]`

| 토큰 | Tailwind 클래스 | hex | 용도 |
|------|-----------------|-----|------|
| primary | `brand-violet` | `#7C3AED` | CTA, 브랜드 포인트 |
| primary hover | `brand-violet-hover` | `#6D28D9` | CTA hover |
| category-stationery bg | `category-stationery-bg` | `#FFF8DB` | 문구 카드·칩 배경 |
| category-stationery border | `category-stationery-border` | `#FDE68A` | 문구 테두리 |
| category-stationery text | `category-stationery-text` | `#92400E` | 문구 텍스트 |
| category-accessory bg | `category-accessory-bg` | `#FFF0F5` | 액세서리 배경 |
| category-accessory border | `category-accessory-border` | `#FBCFE8` | 액세서리 테두리 |
| category-accessory text | `category-accessory-text` | `#9D174D` | 액세서리 텍스트 |
| category-living bg | `category-living-bg` | `#ECFDF5` | 리빙 배경 |
| category-living border | `category-living-border` | `#A7F3D0` | 리빙 테두리 |
| category-living text | `category-living-text` | `#065F46` | 리빙 텍스트 |
| category-living-peach bg | `category-living-peach-bg` | `#FFF7ED` | 리빙 피치 변형 (예비) |
| surface | `slate-50` | — | 쇼핑몰 배경 |
| surface-dark | `slate-950` | — | 어드민 배경 |
| text | `slate-900` | — | 본문 |
| danger | `rose-600` | — | 삭제·경고 |

### 코드 헬퍼

`apps/web-shop/src/lib/categories.ts` — 카테고리별 Tailwind 클래스 매핑

## 타이포

| 스타일 | 클래스 |
|--------|--------|
| H1 | `text-3xl font-bold tracking-tight` |
| H2 | `text-2xl font-bold` |
| Body | `text-sm` / `text-base` |
| Caption | `text-xs text-slate-500` |

## 컴포넌트 (`@goodz/ui`)

| Claude Design / 스펙 | 코드 | 상태 |
|----------------------|------|------|
| Button/Primary | `Button variant="primary"` | ✅ |
| Button/Secondary | `Button variant="secondary"` | ✅ |
| Button/Danger | `Button variant="danger"` | ✅ |
| Card | `Card` | ✅ |
| ProductCard | `ProductGrid` (web-shop) | ✅ P2 handoff |
| ShopHeader | `ShopHeader` (web-shop) | ✅ P2 handoff |
| CategoryCards | `CategoryCards` (web-shop) | ✅ P2 handoff |
| CartEmptyState | `CartEmptyState` (web-shop) | ✅ P2 handoff |
| CheckoutOrderSummary | `CheckoutOrderSummary` (web-shop) | ✅ P2 handoff |
| OrderSuccessCard | `OrderSuccessCard` (web-shop) | ✅ P2 handoff |
| AdminLayout | `AdminLayout` (admin) | ✅ P2 handoff |
| ProductTable | `ProductTable` (admin) | ✅ P2 handoff |

## 신규 컴포넌트 추가 절차

1. Claude Design 프로토타입에서 컴포넌트 확정
2. `packages/ui/src/` 구현
3. `/design-sync` 재실행 (선택)
4. `screens/*.md` · `DESIGN_SYSTEM.md` 갱신
