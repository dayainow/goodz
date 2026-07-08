# Goodz — 굿즈 이커머스 풀스택 모노레포

[![CI](https://github.com/dayainow/goodz/actions/workflows/ci.yml/badge.svg)](https://github.com/dayainow/goodz/actions/workflows/ci.yml)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)

Turborepo + pnpm 기반 굿즈 이커머스 풀스택 모노레포입니다.  
**기획 → 디자인 → 개발 → QA → 배포** 전 과정을 실제 회사 산출물 형식(PRD, Claude Design, ADR, Phase Gate)으로 관리하는 **풀 프로세스 레퍼런스 프로젝트**입니다.

👉 **[PROJECT.md](./PROJECT.md)** — Phase 상태 · 워크플로우 허브

---

## 왜 이 프로젝트인가

| 목표 | 설명 |
|------|------|
| **풀 프로세스 실습** | P0 기획부터 P4 배포까지 단계별 산출물·게이트를 GitHub에서 추적 |
| **타입 안전 풀스택** | `@goodz/types` SSOT로 API · 쇼핑몰 · 어드민 E2E 타입 일치 |
| **AI 협업 표준** | Phase별 Cursor/Hermes 스킬 + 이슈·PR 템플릿으로 에이전트 역할 분리 |
| **검증 가능한 품질** | `pnpm verify` + GitHub Actions CI, GA4는 [GA Analytics Harness](https://github.com/dayainow/ga-analytics-harness) 연동 예정 |

---

## 앱 구성

| 앱 | 스택 | 포트 | 역할 |
|----|------|------|------|
| **web-shop** | Next.js 15 App Router | `:3000` | B2C 쇼핑몰 (상품 목록·상세·장바구니·결제) |
| **admin-dashboard** | Vite + React | `:5173` | 상품·주문 관리 어드민 |
| **api-server** | Express + TypeScript | `:4000` | REST API · Mock 데이터 |

### 공유 패키지

| 패키지 | 역할 |
|--------|------|
| `@goodz/types` | `Product` 등 도메인 타입 SSOT |
| `@goodz/ui` | 공유 UI 컴포넌트 · Tailwind preset |
| `@goodz/tsconfig` | 모노레포 TypeScript 설정 |

---

## 저장소 구조

```text
goodz/
├── PROJECT.md                 # Phase 상태 · 링크 허브
├── docs/
│   ├── 00-process/            # WORKFLOW · PHASE_GATES
│   ├── 01-planning/           # PRD · USER_STORIES · GA4_EVENTS
│   ├── 02-design/             # CLAUDE_DESIGN · DESIGN_BRIEF · DESIGN_SYSTEM
│   ├── 03-engineering/        # ARCHITECTURE · API · ADR
│   └── 04-qa/                 # TEST_PLAN · RELEASE_CHECKLIST
├── skills/                    # goodz-planning · design · dev
├── apps/                      # web-shop · admin-dashboard · api-server
├── packages/                  # types · ui · tsconfig
└── .github/                   # CI · 이슈/PR 템플릿
```

---

## 시작하기

```bash
git clone https://github.com/dayainow/goodz.git
cd goodz
pnpm install
pnpm build
pnpm dev          # API :4000 · Shop :3000 · Admin :5173
pnpm verify       # build + lint (PR·커밋 전 필수)
```

### 환경 변수

| 파일 | 변수 |
|------|------|
| `apps/web-shop/.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:4000` |
| `apps/admin-dashboard/.env` | `VITE_API_URL=http://localhost:4000` |

---

## 풀 프로세스 (Phase)

```text
P0 기획          P1 디자인         P2 개발           P3 QA            P4 배포
────────         ────────         ────────         ────────         ────────
PRD              Claude Design    @goodz/types     pnpm verify      CI green
유저스토리        /design-sync      api → apps       E2E 시나리오      스테이징
GA4 명세         화면 프로토타입    PR + 리뷰        GA harness       프로덕션
     │                │                │                │                │
     └────────────────┴────────────────┴────────────────┴────────────────┘
                              Phase Gate (docs/00-process/PHASE_GATES.md)
```

| Phase | 상태 | 산출물 |
|-------|------|--------|
| **P0 기획** | 🟢 Gate 통과 | [PRD](./docs/01-planning/PRD.md) · [유저스토리](./docs/01-planning/USER_STORIES.md) · [GA4](./docs/01-planning/GA4_EVENTS.md) |
| **P1 디자인** | 🟡 진행 중 | [Claude Design](./docs/02-design/CLAUDE_DESIGN.md) · [디자인 브리프](./docs/02-design/DESIGN_BRIEF.md) |
| **P2 개발** | 🟢 S1 MVP 완료 | [아키텍처](./docs/03-engineering/ARCHITECTURE.md) · [API](./docs/03-engineering/API.md) |
| **P3 QA** | ⚪ 대기 | [테스트 플랜](./docs/04-qa/TEST_PLAN.md) |
| **P4 배포** | ⚪ 대기 | [릴리스 체크리스트](./docs/04-qa/RELEASE_CHECKLIST.md) |

상세 워크플로우: [docs/00-process/WORKFLOW.md](./docs/00-process/WORKFLOW.md)

---

## GitHub 협업

| 항목 | 설명 |
|------|------|
| **브랜치** | `main` · `develop` · `feature/*` · `design/*` · `docs/*` |
| **이슈** | 기획 / 기능 / 버그 템플릿 (`.github/ISSUE_TEMPLATE/`) |
| **PR** | Phase 체크리스트 + `pnpm verify` 통과 필수 |
| **CI** | push·PR 시 [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) 자동 실행 |

---

## AI 에이전트 (Hermes · Cursor)

| Phase | 스킬 | 경로 |
|-------|------|------|
| P0 기획 | `goodz-planning` | `skills/goodz-planning/SKILL.md` |
| P1 디자인 | `goodz-design` | `skills/goodz-design/SKILL.md` |
| P2 개발 | `goodz-dev` | `skills/goodz-dev/SKILL.md` |

```bash
# Hermes 스킬 등록
cd goodz
ln -sf "$(pwd)/skills/goodz-planning" ~/.hermes/skills/goodz-planning
ln -sf "$(pwd)/skills/goodz-design" ~/.hermes/skills/goodz-design
ln -sf "$(pwd)/skills/goodz-dev" ~/.hermes/skills/goodz-dev
```

- [Hermes 연동 가이드](./docs/HERMES.md)
- [AGENTS.md](./AGENTS.md) — 코딩 에이전트 규칙

---

## 기술 스택

```text
Monorepo   Turborepo · pnpm workspaces
Frontend   Next.js 15 · React 19 · Vite · Tailwind CSS
Backend    Express · TypeScript
Shared     @goodz/types (SSOT) · @goodz/ui
Quality    ESLint · Turbo cache · GitHub Actions
AI         Cursor · Claude Code + Claude Design · Hermes (선택)
```

---

## 관련 프로젝트

| 프로젝트 | 연동 |
|----------|------|
| [GA Analytics Harness](https://github.com/dayainow/ga-analytics-harness) | GA4 이벤트 명세 → 코드 · MSW · compliance 게이트 |
| [Frontend Agent Orchestrator Kit](https://github.com/dayainow/frontend-agent-orchestrator-kit) | 기획/디자인 → 구현 → QA 에이전트 오케스트레이션 |
| [Claude Design](https://claude.ai/design) | **P1 공식** — `/design-sync`로 `@goodz/ui` 반영 · [가이드](./docs/02-design/CLAUDE_DESIGN.md) |
| [Figma Publish Harness](https://github.com/dayainow/figma-publish) | Figma ↔ 코드 동기화 (보조·선택) |

---

## 라이선스

[MIT](./LICENSE)
