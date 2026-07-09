# Goodz 디자인 시스템

## 컬러 (코드 매핑)

| 토큰 | Tailwind / hex | 용도 |
|------|----------------|------|
| primary | `violet-600` / `#7C3AED` | CTA, 브랜드 포인트 |
| category-stationery | 파스텔 옐로우 | 문구 카테고리 (Claude Design) |
| category-accessory | 파스텔 핑크 | 액세서리 카테고리 |
| category-living | 파스텔 민트·피치 | 리빙 카테고리 |
| surface | `slate-50` | 쇼핑몰 배경 |
| surface-dark | `slate-950` | 어드민 배경 |
| text | `slate-900` | 본문 |
| danger | `rose-600` | 삭제·경고 |

> Sticky Lemon 레퍼런스 톤 — P2 handoff 시 Tailwind 토큰으로 정식화 예정

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
| ProductCard | `ProductGrid` (web-shop) | ✅ |

## 신규 컴포넌트 추가 절차

1. Claude Design 프로토타입에서 컴포넌트 확정
2. `packages/ui/src/` 구현
3. `/design-sync` 재실행 (선택)
4. `screens/*.md` · `DESIGN_SYSTEM.md` 갱신
