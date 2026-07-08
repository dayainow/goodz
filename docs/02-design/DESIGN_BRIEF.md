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
2. **컴포넌트 재사용** — Figma 컴포넌트 ↔ `@goodz/ui` 1:1 매핑 목표
3. **접근성** — 대비 4.5:1, 포커스 링 유지

## 산출물 체크리스트

- [ ] Figma 파일 생성 (`FIGMA.md` 링크 등록)
- [ ] Color / Typography 변수
- [ ] Button, Card, Input 컴포넌트
- [ ] 화면별 스펙 `screens/` 폴더

## 코드 연동

- Tailwind preset: `packages/ui/tailwind.config.ts`
- Figma → 코드: [figma-publish](https://github.com/dayainow/figma-publish) 워크플로우 (선택)
