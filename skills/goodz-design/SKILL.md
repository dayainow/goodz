---
name: goodz-design
description: |
  Goodz 디자인 단계 스킬 — Claude Design, 디자인시스템, 화면 스펙, @goodz/ui 매핑.
  "디자인", "Claude Design", "UI", "화면", "와이어", "프로토타입" 키워드 시 적용.
---

# Goodz Design Skill

> **맥락:** 디자인은 **P1 파이프라인**(Claude Design handoff)을 증명하는 시스템 레이어. 화면 수는 데모 도메인을 위한 것.  
> `docs/00-process/NORTH_STAR.md` · `AGENT_GUIDE.md` 참고.

## P1 공식 스택

**Claude Design** + **Claude Code** (`/design-sync`, `/design`)

| 문서 | 경로 |
|------|------|
| **Claude Design 가이드** | `docs/02-design/CLAUDE_DESIGN.md` |
| 디자인 브리프 | `docs/02-design/DESIGN_BRIEF.md` |
| 디자인시스템 | `docs/02-design/DESIGN_SYSTEM.md` |
| 화면 스펙 | `docs/02-design/screens/` |
| Figma (보조) | `docs/02-design/FIGMA.md` |

## 워크플로우

1. `DESIGN_BRIEF.md` 브랜드·화면 범위 확인
2. Claude Code: `/design-sync` — goodz repo의 `@goodz/ui` · Tailwind 반영
3. [claude.ai/design](https://claude.ai/design)에서 4화면 프로토타입
4. `screens/*.md` 스펙과 프로토타입 정합성 확인
5. `DESIGN_SYSTEM.md` 토큰 ↔ 코드 매핑 갱신
6. handoff → Claude Code / Cursor (`goodz-dev`)로 `apps/web-shop` 반영

## Claude Design → 코드

```text
/design-sync  →  DS import
Claude Design  →  프로토타입
/design 또는 Cursor  →  packages/ui · apps/web-shop
pnpm verify
```

- Figma는 보조 — `FIGMA.md` 참고

## Phase Gate (P1→P2)

- Claude Design 프로토타입 4화면 (목록·상세·장바구니·체크아웃)
- `DESIGN_SYSTEM.md` 매핑표
- `screens/` 스펙과 구현 diff 검토

## 완료 기준

- `CLAUDE_DESIGN.md` 프로젝트 URL 등록
- `/design-sync` 1회 이상 실행
- 화면 스펙 4건 + 프로토타입 링크
- P2 이슈에 Claude Design 프로젝트 링크 첨부
