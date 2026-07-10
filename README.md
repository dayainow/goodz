# Goodz — 굿즈 이커머스 풀스택 모노레포

[![CI](https://github.com/dayainow/goodz/actions/workflows/ci.yml/badge.svg)](https://github.com/dayainow/goodz/actions/workflows/ci.yml)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)

> **코드만 있는 쇼핑몰 데모가 아닙니다.**  
> Goodz는 **기획 → 디자인 → 개발 → QA → 배포**를 문서·게이트·모노레포·CI로 묶은 **풀 프로세스 모노레포 시스템**이며, 쇼핑몰은 그 시스템을 증명하는 레퍼런스입니다.  
> (향후 템플릿·라이선스·컨설팅 패키지로 확장 가능)

👉 **[Process Dashboard](http://localhost:5180)** — 기획·변경·산출물·승인까지 관리하는 풀 프로세스 대시보드 (`pnpm dev`)  
👉 **[North Star](./docs/00-process/NORTH_STAR.md)** — 프로젝트 존재 이유 (에이전트 필독)  
👉 **[에이전트 가이드](./docs/00-process/AGENT_GUIDE.md)** — Cursor / Claude Code 작업 절차  
👉 **[PROJECT.md](./PROJECT.md)** — 현재 Sprint · Phase 상태

---

## 이 프로젝트의 핵심 — 풀 프로세스 모노레포 시스템

Goodz의 **진짜 제품**은 아래입니다. 쇼핑몰 앱은 **데모**입니다.

| 시스템 레이어 | 내용 |
|---------------|------|
| **프로세스** | P0–P4, Phase Gate, Sprint ROADMAP |
| **문서 SSOT** | 기획 입력, 변경 요청, PRD, 스펙, API, ADR, QA, 승인 로그, 추적 링크 |
| **운영 대시보드** | Process Dashboard에서 Phase, 기획, 변경, 산출물, 승인, CI 증거 추적 |
| **모노레포** | Turborepo + pnpm, `@goodz/types`, 3앱 스캐폴드 |
| **품질** | `pnpm verify`, CI, GA harness 연동 패턴 |
| **AI 협업** | Phase별 스킬, Cursor / Claude Code 역할 분리 |

| 원칙 | 설명 |
|------|------|
| **Phase Gate** | P0→P4 단계마다 산출물·체크리스트를 통과해야 다음 단계로 진행 |
| **Process OS** | 기획 입력 → 변경 요청 → 산출물 레지스트리 → 승인 로그 → Commit/CI 증거 → 대시보드 추적 |
| **문서 = SSOT** | Intake·변경 로그·PRD·API·화면 스펙이 코드보다 먼저, GitHub에서 버전 관리 |
| **타입 우선 개발** | `@goodz/types` → API → 앱 순서로 E2E 타입 일치 |
| **검증 가능** | `pnpm verify` + CI로 매 커밋 품질 게이트 |
| **AI 역할 분리** | Phase별 스킬·에이전트(Cursor / Claude Code)로 협업 규칙 명문화 |

### 5단계 프로세스

```mermaid
flowchart LR
  P0[P0 기획] --> G1{Gate}
  G1 --> P1[P1 디자인]
  P1 --> G2{Gate}
  G2 --> P2[P2 개발]
  P2 --> G3{Gate}
  G3 --> P3[P3 QA]
  P3 --> G4{Gate}
  G4 --> P4[P4 배포]
```

| Phase | 핵심 산출물 |
|-------|-------------|
| P0 | 기획 입력 · 변경 로그 · PRD · 유저스토리 · GA4 명세 |
| P1 | Claude Design 12화면 · `screens/` 스펙 |
| P2 | `@goodz/types` → API → 앱 · `pnpm verify` |
| P3 | TEST_PLAN · GA compliance · `check:process` |
| P4 | RELEASE_CHECKLIST · 배포 · 승인 로그 · CI/CD evidence |

```text
P0 기획          P1 디자인         P2 개발           P3 QA            P4 배포
────────         ────────         ────────         ────────         ────────
Intake/변경       Claude Design    @goodz/types     pnpm verify      CI green
PRD              /design-sync      api → apps       E2E 시나리오      스테이징
유저스토리        화면 프로토타입    PR + 리뷰        GA harness       프로덕션
GA4 명세         handoff→Code      ADR              회귀 테스트      승인 로그
     │                │                │                │                │
     └────────────────┴────────────────┴────────────────┴────────────────┘
                         Phase Gate — docs/00-process/PHASE_GATES.md
```

| Phase | 역할 | 핵심 산출물 | 문서 |
|-------|------|-------------|------|
| **P0 기획** | PM | 기획 입력, 변경 로그, PRD, 유저스토리, GA4 퍼널 | [intake/](./docs/01-planning/intake/) · [changes/](./docs/01-planning/changes/) · [PRD](./docs/01-planning/PRD.md) |
| **P1 디자인** | Design | Claude Design 프로토타입, DS, 화면 스펙 | [CLAUDE_DESIGN](./docs/02-design/CLAUDE_DESIGN.md) · [screens/](./docs/02-design/screens/) |
| **P2 개발** | FE/BE | API, 모노레포 코드, ADR | [ARCHITECTURE](./docs/03-engineering/ARCHITECTURE.md) · [API](./docs/03-engineering/API.md) |
| **P3 QA** | QA | 테스트 플랜, GA compliance | [TEST_PLAN](./docs/04-qa/TEST_PLAN.md) |
| **P4 배포** | DevOps | 스테이징·프로덕션 릴리스, 승인 로그 | [RELEASE_CHECKLIST](./docs/04-qa/RELEASE_CHECKLIST.md) · [APPROVALS](./docs/00-process/APPROVALS.md) |

**상세 워크플로우:** [docs/00-process/WORKFLOW.md](./docs/00-process/WORKFLOW.md)

### Sprint 타임라인 (현재)

```text
S0 ✅ 모노레포 스캐폴드   S1 ✅ MVP 쇼핑 플로우   S2 ✅ UI handoff   S3 ✅ QA·스테이징   S4 ✅ Process OS   S5 ✅ Traceability
```

| Phase | 현재 상태 |
|-------|-----------|
| P0 기획 | 🟢 Gate 통과 |
| P1 디자인 | 🟢 12화면 완료 |
| P2 개발 | 🟢 MVP + GA4 harness + 어드민 등록 API |
| P3 QA | 🟢 smoke + staging checklist 통과 |
| P4 배포 | 🟢 release checklist + 승인 로그 준비 |
| Process OS | 🟢 기획 입력·변경·산출물·승인 대시보드 반영 |
| Traceability | 🟢 Issue/PR/Commit/CI 증거 추적 레이어 반영 |

로드맵: [docs/01-planning/ROADMAP.md](./docs/01-planning/ROADMAP.md)

### 이슈 → 개발 → 배포 흐름

```text
GitHub Issue (기획/기능)
    → feature/* 브랜치
    → PR (Phase 체크리스트 + Closes #N)
    → pnpm verify (로컬) + CI (GitHub Actions)
    → merge → traceLinks 갱신 → Phase Gate 갱신
```

Traceability 운영 기준: [TRACEABILITY.md](./docs/00-process/TRACEABILITY.md) · CI/CD 기준: [CICD.md](./docs/00-process/CICD.md)

---

## 모노레포 — Turborepo + pnpm

기능은 **3앱 + 2공유 패키지**로 나뉘고, Turborepo가 빌드 순서·캐시를 관리합니다.

```text
                    ┌─────────────────┐
                    │ admin-dashboard │  Vite :5173
                    └────────┬────────┘
                             │ fetch
┌──────────────┐             │             ┌──────────────┐
│   web-shop   │─────────────┼────────────│  api-server  │  Express :4000
│   Next.js    │             │             └──────┬───────┘
└──────┬───────┘             │                    │
       └──────────┬──────────┴──────────┬─────────┘
                  │                     │
           ┌──────▼──────┐       ┌──────▼──────┐
           │ @goodz/types │       │  @goodz/ui  │
           │   (SSOT)     │       │  components │
           └─────────────┘       └─────────────┘
```

| 앱 | 스택 | 포트 | 역할 |
|----|------|------|------|
| **web-shop** | Next.js 15 | `:3000` | B2C 쇼핑몰 |
| **admin-dashboard** | Vite + React | `:5173` | 상품·운영 관리 |
| **process-dashboard** | Vite + React | `:5180` | **기획·변경·산출물·승인·Phase 관리** |
| **api-server** | Express + TS | `:4000` | REST API · Mock · status SSOT |

| 패키지 | 역할 |
|--------|------|
| `@goodz/types` | `Product`, `Cart` 등 도메인 타입 **SSOT** |
| `@goodz/ui` | Button, Card · Tailwind preset |
| `@goodz/tsconfig` | 공유 TypeScript 설정 |

### 기능 추가 순서 (P2 규칙)

```text
① packages/types/src   ← 타입 먼저
② apps/api-server      ← API
③ packages/ui          ← 공통 UI (필요 시)
④ apps/web-shop / admin-dashboard
⑤ docs/API.md 갱신 + pnpm verify
```

### 모노레포 품질 게이트

| 검사 | 명령 | 역할 |
|------|------|------|
| 워크스페이스 일관성 | `pnpm check:workspace` | manypkg |
| 유령 의존성 | `pnpm check:deps` | depcheck |
| Process OS 정합성 | `pnpm check:process` | status.json · 산출물 · traceLinks |
| 빌드 + 린트 | `turbo build && turbo lint` | Turborepo computational cache |
| **전체** | **`pnpm verify`** | PR·커밋 전 필수 |

- pnpm `node-linker=isolated` — 유령 의존성 방지
- CI: `.turbo/cache` 복원 + [ga-analytics-harness](https://github.com/dayainow/ga-analytics-harness) 형제 checkout

ADR: [001 — Turborepo + pnpm 선택](./docs/03-engineering/ADR/001-monorepo-turborepo.md)

---

## AI 에이전트 협업

Phase마다 **다른 도구·스킬**을 쓰고, 동시 작업 시 git은 Cursor가 전담합니다.

| Phase | 도구 | 스킬 |
|-------|------|------|
| **시스템** | Cursor | `skills/goodz-system/` |
| P0 기획 | Notion, Issues | `skills/goodz-planning/` |
| P1 디자인 | Claude Design + Claude Code | `skills/goodz-design/` |
| P2 개발 | **Cursor** | `skills/goodz-dev/` |
| P3 QA | `pnpm verify`, GA harness | — |

| 도구 | 진입 문서 |
|------|-----------|
| **Cursor** | [AGENTS.md](./AGENTS.md) · `.cursor/rules/` |
| **Claude Code** | [CLAUDE.md](./CLAUDE.md) |

| 에이전트 | git |
|----------|-----|
| **Cursor** | ✅ add / commit / push 전담 |
| **Claude Code** | ❌ 파일 생성만 (디자인 산출물) |

- [AGENTS.md](./AGENTS.md) — 에이전트 규칙
- [Hermes 연동](./docs/HERMES.md) — 선택

---

## 저장소 구조

```text
goodz/
├── PROJECT.md                 # Phase · Sprint 상태 허브
├── docs/
│   ├── 00-process/            # WORKFLOW · PHASE_GATES · APPROVALS · TRACEABILITY · CICD
│   ├── 01-planning/           # intake/ · changes/ · PRD · USER_STORIES · ROADMAP · GA4
│   ├── 02-design/             # CLAUDE_DESIGN · DESIGN_SYSTEM · screens/
│   ├── 03-engineering/        # ARCHITECTURE · API · ADR
│   ├── 04-qa/                 # TEST_PLAN · RELEASE_CHECKLIST
│   └── deliverables/          # 산출물 레지스트리
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
pnpm dev          # API :4000 · Shop :3000 · Admin :5173 · Process :5180
pnpm verify       # workspace + deps + process + build + lint (PR 전 필수)
pnpm check:process # status.json · 산출물 · traceLinks 검증
pnpm smoke:staging # API + 3개 화면 smoke check
```

### 환경 변수

| 파일 | 변수 |
|------|------|
| `apps/web-shop/.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:4000` |
| `apps/admin-dashboard/.env` | `VITE_API_URL=http://localhost:4000` |
| `apps/process-dashboard/.env` | `VITE_API_URL=http://localhost:4000` |

스테이징 배포 절차와 smoke URL override는 [STAGING_RUNBOOK.md](./docs/04-qa/STAGING_RUNBOOK.md)를 기준으로 합니다.

---

## GitHub 협업

| 항목 | 설명 |
|------|------|
| **브랜치** | `main` · `develop` · `feature/*` · `design/*` · `docs/*` |
| **이슈** | 기획 / 기능 / 버그 템플릿 |
| **PR** | Phase 체크리스트 + `pnpm verify` + `Closes #이슈` |
| **CI** | [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) — push·PR 시 자동 |
| **Trace** | [TRACEABILITY.md](./docs/00-process/TRACEABILITY.md) — Issue/PR/Commit/CI 증거 연결 |

---

## 기술 스택

```text
Process    Phase Gate · Process OS · Traceability · 산출물 레지스트리 · 승인 로그
Monorepo   Turborepo · pnpm workspaces · @goodz/types SSOT
Frontend   Next.js 15 · React 19 · Vite · Tailwind CSS
Backend    Express · TypeScript
Quality    pnpm verify · check:process · Turbo cache · GitHub Actions · GA harness
AI         Cursor (코드) · Claude Code (디자인) · Hermes (선택)
```

---

## 관련 프로젝트

| 프로젝트 | 연동 |
|----------|------|
| [GA Analytics Harness](https://github.com/dayainow/ga-analytics-harness) | GA4 이벤트 명세 → 코드 · MSW · compliance |
| [Claude Design](https://claude.ai/design) | P1 디자인 — [가이드](./docs/02-design/CLAUDE_DESIGN.md) |
| [Frontend Agent Orchestrator Kit](https://github.com/dayainow/frontend-agent-orchestrator-kit) | 기획/디자인 → 구현 → QA 오케스트레이션 |
| [Figma Publish Harness](https://github.com/dayainow/figma-publish) | Figma ↔ 코드 (보조) |

---

## 라이선스

[MIT](./LICENSE)
