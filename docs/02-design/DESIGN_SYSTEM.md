# Goodz 디자인 시스템

## 컬러 (코드 매핑)

| 토큰 | Tailwind | 용도 |
|------|----------|------|
| primary | `violet-600` | CTA, 브랜드 |
| surface | `slate-50` | 쇼핑몰 배경 |
| surface-dark | `slate-950` | 어드민 배경 |
| text | `slate-900` | 본문 |
| danger | `rose-600` | 삭제·경고 |

## 타이포

| 스타일 | 클래스 |
|--------|--------|
| H1 | `text-3xl font-bold tracking-tight` |
| H2 | `text-2xl font-bold` |
| Body | `text-sm` / `text-base` |
| Caption | `text-xs text-slate-500` |

## 컴포넌트 (`@goodz/ui`)

| Figma | 코드 | 상태 |
|-------|------|------|
| Button/Primary | `Button variant="primary"` | ✅ |
| Button/Secondary | `Button variant="secondary"` | ✅ |
| Button/Danger | `Button variant="danger"` | ✅ |
| Card | `Card` | 🟡 S1 |
| ProductCard | `ProductCard` (web-shop) | 🟡 S1 |

## 신규 컴포넌트 추가 절차

1. Figma 컴포넌트 확정
2. `packages/ui/src/` 구현
3. 양 앱 `tailwind.config` content 경로 확인
4. Storybook (선택, P2)
