# Goodz 디자인 브리프

## 브랜드

| 항목 | 값 |
|------|-----|
| 이름 | Goodz |
| 톤 | 밝고 친근한 굿즈 숍, 보라(violet) 포인트 |
| 타깃 | 20–30대 굿즈 수집·구매층 |

## MVP 화면 범위 (P1 — 12화면)

| 화면 | 앱 | 우선순위 |
|------|-----|----------|
| Home | web-shop | P0 |
| Shop (전체 상품) | web-shop | P0 |
| Category | web-shop | P0 |
| 상품 상세 | web-shop | P0 |
| 장바구니 / Empty | web-shop | P1 |
| 체크아웃 / 결제 완료 | web-shop | P1 |
| 검색 · About | web-shop | P2+ |
| 상품 목록 · 등록 | admin | P0 |

레퍼런스: [Sticky Lemon](https://www.stickylemon.nl/) — 파스텔 카테고리 톤, NEW IN, 넉넉한 여백  
브랜드 CTA: violet `#7C3AED`

## 디자인 원칙

1. **모바일 퍼스트** — 쇼핑몰은 375px 기준
2. **컴포넌트 재사용** — Claude Design 컴포넌트 ↔ `@goodz/ui` 1:1 매핑 목표
3. **접근성** — 대비 4.5:1, 포커스 링 유지

## 산출물 체크리스트

- [x] Claude Design 프로젝트 → [CLAUDE_DESIGN.md](./CLAUDE_DESIGN.md)
- [x] `/design-sync` DS 반영 (초기)
- [x] 12화면 프로토타입 (쇼핑 10 + 어드민 2)
- [x] 화면별 스펙 [screens/](./screens/README.md)

## 코드 연동

- Tailwind preset: `packages/ui/tailwind.config.ts`
- **P1:** [Claude Design](./CLAUDE_DESIGN.md) + Claude Code `/design-sync`
- (선택) Figma: [figma-publish](https://github.com/dayainow/figma-publish)
