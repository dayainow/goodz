---
name: goodz-design
description: |
  Goodz 디자인 단계 스킬 — Figma, 디자인시스템, 화면 스펙, @goodz/ui 매핑.
  "디자인", "Figma", "UI", "화면", "와이어", "컴포넌트" 키워드 시 적용.
---

# Goodz Design Skill

## 산출물 위치

| 문서 | 경로 |
|------|------|
| 디자인 브리프 | `docs/02-design/DESIGN_BRIEF.md` |
| 디자인시스템 | `docs/02-design/DESIGN_SYSTEM.md` |
| Figma | `docs/02-design/FIGMA.md` |
| 화면 스펙 | `docs/02-design/screens/` |

## 워크플로우

1. `DESIGN_BRIEF.md` 브랜드·화면 범위 확인
2. Figma 파일/링크 `FIGMA.md` 등록
3. 컴포넌트는 `@goodz/ui` 우선 — 없으면 ui 패키지에 추가 제안
4. 화면별 `screens/*.md` 스펙 작성
5. `DESIGN_SYSTEM.md` 토큰 ↔ Tailwind 매핑 갱신

## Figma → 코드

- Figma MCP: metadata 재귀 → design_context
- 구현: `packages/ui` 또는 앱 `components/`
- Tailwind: 앱 `content`에 `packages/ui/src/**` 포함 필수

## Phase Gate (P1→P2)

- 핵심 3화면 스펙 완료
- Button 등 공통 컴포넌트 Figma↔코드 매핑표

## 완료 기준

- `FIGMA.md` 링크 등록
- 화면 스펙 1건 이상
- P2 개발 이슈에 Figma node-id 전달
