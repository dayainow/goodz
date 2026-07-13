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

## Premium White UI 원칙

v0.14부터 프로세스 대시보드는 쇼핑몰의 pastel merchandising 톤과 분리된 운영 콘솔 테마를 사용합니다.

| 항목 | 기준 |
|------|------|
| 기본 표면 | `white`, `#FAFAFA`, `zinc-100` 계열 |
| 구분선 | `zinc-200` 1px 보더 중심 |
| 그림자 | 낮은 two-layer shadow: `0 1px 3px` + `0 8px 24px` |
| 주요 액센트 | near-black active state + 제한적 `brand-violet` |
| 상태 색상 | emerald(success), amber(warning), rose(risk)만 의미 기반으로 사용 |
| metadata | 12-13px, uppercase, `zinc-500` |

운영 대시보드에서 pastel 배경은 일반 카드 장식으로 쓰지 않습니다. 색은 상태, 위험도, 다음 액션을 구분하는 신호로만 사용합니다.

### v0.16 Detail Tuning

- Font stack: Noto Sans KR, Pretendard, system-ui
- Heading line-height: 1.15 / Body line-height: 1.5
- Radius: 주요 카드 12px, 작은 badge는 full radius
- Base shadow: 0 1px 2px rgba(0,0,0,0.04)
- Elevated shadow: primary action에만 0 12px 32px rgba(76,29,149,0.10)
- Hover lift: 클릭 가능한 action, metric, phase 카드에만 4px
- Progress: near-black fill + zinc-200 track
- Inactive navigation: zinc-600 text와 zinc-300 border 중 최소 하나는 충분한 대비 유지

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
