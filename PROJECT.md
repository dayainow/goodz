# Goodz 프로젝트 허브

> 굿즈 이커머스 — 기획 → 디자인 → 개발 → QA → 배포 전 과정을 **회사 산출물 형식**으로 관리합니다.

## 현재 스프린트: **S1 — MVP 쇼핑 플로우**

👉 [ROADMAP](./docs/01-planning/ROADMAP.md) · [유저스토리](./docs/01-planning/USER_STORIES.md)

## 현재 단계

| Phase | 상태 | 산출물 |
|-------|------|--------|
| **P0 기획** | 🟢 Gate 통과 | [PRD](./docs/01-planning/PRD.md) · [유저스토리](./docs/01-planning/USER_STORIES.md) · [로드맵](./docs/01-planning/ROADMAP.md) |
| **P1 디자인** | 🟡 진행 중 | [디자인 브리프](./docs/02-design/DESIGN_BRIEF.md) · [화면 스펙](./docs/02-design/screens/) |
| **P2 개발** | 🟢 S1 MVP 플로우 완료 | 상품 상세 · 장바구니 · 체크아웃 ✅ |
| **P3 QA** | ⚪ 대기 | [테스트 플랜](./docs/04-qa/TEST_PLAN.md) |
| **P4 배포** | ⚪ 대기 | [릴리스 체크리스트](./docs/04-qa/RELEASE_CHECKLIST.md) |

## S1 이번 주 목표

- [x] ROADMAP · PRD Approved
- [x] GitHub Issues 5건+
- [x] 상품 상세 `/products/[id]`
- [x] 장바구니 API + `/cart`
- [x] 체크아웃 mock + `/checkout`
- [x] `pnpm verify` pass

## 풀 프로세스 (회사 표준)

```text
P0 기획          P1 디자인         P2 개발           P3 QA            P4 배포
────────         ────────         ────────         ────────         ────────
PRD              Figma            @goodz/types     pnpm verify      CI green
유저스토리        디자인시스템      api → apps       E2E 시나리오      스테이징
GA4 명세         화면 목록         PR + 리뷰        GA harness       프로덕션
Notion SSOT      Code Connect?     ADR              회귀 테스트
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
