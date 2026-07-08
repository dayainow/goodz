# Goodz 프로젝트 허브

> 굿즈 이커머스 — 기획 → 디자인 → 개발 → QA → 배포 전 과정을 **회사 산출물 형식**으로 관리합니다.

## 현재 스프린트: **S2 — Claude Design P1**

👉 [ROADMAP](./docs/01-planning/ROADMAP.md) · [유저스토리](./docs/01-planning/USER_STORIES.md)

## 현재 단계

| Phase | 상태 | 산출물 |
|-------|------|--------|
| **P0 기획** | 🟢 Gate 통과 | [PRD](./docs/01-planning/PRD.md) · [유저스토리](./docs/01-planning/USER_STORIES.md) · [로드맵](./docs/01-planning/ROADMAP.md) |
| **P1 디자인** | 🟡 진행 중 | [Claude Design](./docs/02-design/CLAUDE_DESIGN.md) · `/design-sync` |
| **P2 개발** | 🟢 S1 MVP 플로우 완료 | 상품 상세 · 장바구니 · 체크아웃 ✅ |
| **P3 QA** | ⚪ 대기 | [테스트 플랜](./docs/04-qa/TEST_PLAN.md) |
| **P4 배포** | ⚪ 대기 | [릴리스 체크리스트](./docs/04-qa/RELEASE_CHECKLIST.md) |

## S2 이번 주 목표

- [ ] Claude Design MCP `/design-login`
- [ ] `/design-sync` (goodz DS)
- [ ] 4화면 프로토타입 (목록·상세·장바구니·체크아웃)
- [ ] `CLAUDE_DESIGN.md` 프로젝트 URL 등록
- [x] GA4 harness (#8) ✅
- [x] 어드민 상품 등록 mock API ✅

## 풀 프로세스 (회사 표준)

```text
P0 기획          P1 디자인         P2 개발           P3 QA            P4 배포
────────         ────────         ────────         ────────         ────────
PRD              Claude Design    @goodz/types     pnpm verify      CI green
유저스토리        /design-sync      api → apps       E2E 시나리오      스테이징
GA4 명세         화면 프로토타입    PR + 리뷰        GA harness       프로덕션
Notion SSOT      handoff→Code      ADR              회귀 테스트
     │                │                │                │                │
     └────────────────┴────────────────┴────────────────┴────────────────┘
                              Phase Gate (docs/00-process/PHASE_GATES.md)
```

## 에이전트 스킬 (단계별)

| Phase | 스킬 | 경로 |
|-------|------|------|
| 기획 | `goodz-planning` | `skills/goodz-planning/SKILL.md` |
| 디자인 | `goodz-design` | `skills/goodz-design/SKILL.md` |
| 개발 | `goodz-dev` | `skills/goodz-dev/SKILL.md` |

Hermes: `ln -sf $(pwd)/skills/goodz-* ~/.hermes/skills/`

## 빠른 링크

- [전체 워크플로우](./docs/00-process/WORKFLOW.md)
- [아키텍처](./docs/03-engineering/ARCHITECTURE.md)
- [API 명세](./docs/03-engineering/API.md)
- [Hermes 연동](./docs/HERMES.md)
- [AGENTS.md](./AGENTS.md) — 코딩 에이전트 규칙

## 저장소

- GitHub: https://github.com/dayainow/goodz
- 이슈: GitHub Issues (기획/기능/버그 템플릿)
- PR: `.github/PULL_REQUEST_TEMPLATE.md`
