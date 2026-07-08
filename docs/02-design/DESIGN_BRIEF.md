# Goodz 디자인 브리프

## 브랜드

| 항목 | 값 |
|------|-----|
| 이름 | Goodz |
| 톤 | 밝고 친근한 굿즈 숍, 보라(violet) 포인트 |
| 타깃 | 20–30대 굿즈 수집·구매층 |

## MVP 화면 범위

| 화면 | 앱 | 우선순위 |
|------|-----|----------|
| 상품 목록 | web-shop | P0 |
| 상품 상세 | web-shop | P0 |
| 장바구니 | web-shop | P1 |
| 체크아웃 | web-shop | P1 |
| 상품 관리 | admin | P0 |

## 디자인 원칙

1. **모바일 퍼스트** — 쇼핑몰은 375px 기준
2. **컴포넌트 재사용** — Claude Design 컴포넌트 ↔ `@goodz/ui` 1:1 매핑 목표
3. **접근성** — 대비 4.5:1, 포커스 링 유지

## 산출물 체크리스트

- [ ] Claude Design 프로젝트 → [CLAUDE_DESIGN.md](./CLAUDE_DESIGN.md)
- [ ] `/design-sync` DS 반영
- [ ] 4화면 프로토타입
- [x] 화면별 스펙 `screens/` 폴더

## 코드 연동

- Tailwind preset: `packages/ui/tailwind.config.ts`
- **P1:** [Claude Design](./CLAUDE_DESIGN.md) + Claude Code `/design-sync`
- (선택) Figma: [figma-publish](https://github.com/dayainow/figma-publish)
