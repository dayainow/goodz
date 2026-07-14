# Goodz — 풀 프로세스 운영 시스템

[![CI](https://github.com/dayainow/goodz/actions/workflows/ci.yml/badge.svg)](https://github.com/dayainow/goodz/actions/workflows/ci.yml)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)

> **Goodz는 새로운 제품·서비스를 처음 기획하는 순간부터 배포까지 실행·관리하는 Process Control Plane입니다.**
>
> 아이디어 → PRD → 디자인 → 개발 → QA → 배포를 문서·Phase Gate·코드·CI·승인·운영 지표로 연결합니다. Goodz Commerce와 Internal Service Reference는 같은 Core로 서로 다른 프로젝트를 운영할 수 있음을 검증합니다.

👉 **[Process Dashboard](http://localhost:5180)** — 프로젝트·Stage·Task·GO/HOLD/KILL Gate를 실행하는 Process Control Plane (`pnpm dev`)
👉 **[North Star](./docs/00-process/NORTH_STAR.md)** — 프로젝트 존재 이유 (에이전트 필독)  
👉 **[에이전트 가이드](./docs/00-process/AGENT_GUIDE.md)** — Cursor / Claude Code 작업 절차  
👉 **[PROJECT.md](./PROJECT.md)** — 현재 Sprint · Phase 상태

👉 **[Goodz Core Onboarding](./docs/00-process/ONBOARDING.md)** — 조직 설정 후 30분 안에 첫 Gate 시작하기
👉 **[Portability Proof](./docs/00-process/PORTABILITY.md)** — 비커머스 Reference와 Core 무변경 검증
👉 **[Dashboard Redesign PRD](./docs/01-planning/PRD-PROCESS-DASHBOARD-REDESIGN.md)** — Hero·Sidebar·Phase·Metrics 디자인 리셋 기준

---

## Goodz는 무엇을 하는가

Goodz는 Jira, GitHub, Claude Design과 CI를 프로젝트의 단계별 실행 도구로 연결합니다. 사용자는 아이디어를 등록한 뒤 각 단계에서 생성되는 요청·산출물·승인·코드·배포 증거를 하나의 운영 흐름으로 관리합니다.

```text
요청 → PRD → 디자인 → 타입/API/앱 → 테스트 → 승인 → CI → 배포
 │                                                        │
 └────────────── Goodz가 연결·검증·시각화 ────────────────┘
```

| Goodz가 담당하는 것 | 결과 |
|---|---|
| P0–P4 표준 워크플로와 Phase Gate | 준비되지 않은 상태에서 다음 단계로 넘어가는 일을 줄임 |
| PRD·API·QA·릴리스 문서 SSOT | 사람이 바뀌어도 프로젝트 맥락을 다시 찾을 수 있음 |
| 요청→산출물→승인→Commit→CI 추적 | 변경 이유와 실행 증거를 함께 확인 |
| Process Dashboard | 현재 단계, 작업 큐, 누락 증거와 운영 건강도를 한 화면에서 확인 |
| `pnpm verify`와 CI | 문서·타입·의존성·빌드·린트 계약을 반복 검증 |
| AI 스킬과 에이전트 규칙 | Cursor·Claude Code가 같은 절차와 책임 경계로 작업 |

제품 경계는 다음과 같습니다.

- **Goodz Core**: Process 모델, Gate, 검증, 문서 계약과 Process Dashboard
- **Goodz Cloud**: 향후 호스팅, 협업, Connector와 관리형 업그레이드
- **Goodz Enterprise**: 향후 SSO/RBAC, 감사, 정책 팩, VPC/온프레미스와 SLA
- **References**: Commerce와 Internal Service 실행 예제

## v1.0에서 실제로 관리할 수 있는 것

Process Dashboard는 더 이상 상태만 보여주는 화면이 아닙니다. 사용자가 P0–P4 또는 Phase 0–8 Template으로 프로젝트를 시작하고 실행 상태·산출물·증거를 직접 관리할 수 있습니다.

| 사용자 작업 | 시스템 동작 |
|---|---|
| 프로젝트 생성 | 선택한 Template version을 독립적인 Process Run으로 복제 |
| Stage·Task 운영 | 현재 Stage의 Task 상태와 담당자 저장, 차단 상태 반영 |
| Gate 결정 | GO/HOLD/KILL 근거 기록, 미완료 Task의 GO와 Phase 건너뛰기 차단 |
| 다음 단계 전환 | GO 시 현재 Stage 완료와 다음 Stage 자동 시작 |
| 실행 감사 | 프로젝트·Task·Stage·Gate command를 append-only audit event로 기록 |
| Template Catalog | 파일 기반 기본 Template 2종과 SQLite 사용자 Template을 함께 제공 |
| Template Migration | 기존 정의와 실행을 보존한 채 다음 immutable version을 만들고 새 프로젝트에 선택 적용 |
| 산출물·증거 | 필수 산출물의 제출·승인과 문서/Issue/PR/CI/Release 링크를 Stage에 연결 |
| Visual Template Builder | 폼에서 Stage·Task·산출물을 추가·삭제·정렬하고 기존 Template을 복제 편집 |
| PRD Wizard | 문제·사용자·가치·범위·비목표·지표·제약을 질문형으로 작성하고 Markdown PRD 생성·승인 |
| Design Workbench | 화면 와이어프레임, 스토리보드, 콘셉트와 Claude Design handoff prompt·결과 URL 관리 |
| Design Job | 전달 대기·작업 중·결과 검토·수정 필요·승인 상태와 prompt snapshot 관리 |
| Project Export | 승인 PRD·Design Pack·Claude handoff Markdown portable bundle 다운로드 |
| Goodz CLI | 저장소 초기화·기존 구조 adopt, API 프로젝트 생성, 안전한 Markdown materialize와 export 무결성 검증 |
| Git Connector | 승인 bundle만 별도 branch에 commit·push하고 GitHub Pull Request 생성 |
| 설치·업그레이드 Gate | config v1→v2 migration과 clean-clone install·CLI·Portability 자동 검증 |

가변 실행 상태는 SQLite schema v5가 기준이며, 승인 전 PRD/Design 초안과 Design Job 실행 상태를 저장합니다. 승인 결과는 portable bundle로 반환되고 Goodz CLI가 이를 충돌 보호된 Git-ready Markdown으로 생성합니다. 기존 모노레포는 읽기 전용 adopt 계획 후 적용하고, Template 변경은 새 버전으로 생성하며, 승인 bundle은 제한된 Git branch/commit/push/PR 흐름으로 전달할 수 있습니다. Claude MCP/API 호출, RBAC와 PostgreSQL은 다음 단계입니다.

## 새 프로젝트를 처음 시작한다면

v1.0의 `@goodz/cli`는 초기화·기존 저장소 adopt·config/Template migration·프로젝트 생성·산출물 export·Git publish·무결성 검증을 제공합니다. 전체 scaffold는 Goodz 저장소 Template을 사용하며 clean-clone Gate가 생성물 없는 설치를 검증합니다.

### 1. 저장소 준비

```bash
git clone <your-goodz-repository-url>
cd <your-goodz-repository>
corepack enable
pnpm install --frozen-lockfile
pnpm verify
```

최초 `pnpm verify`가 실패하면 제품 코드 작성 전에 workspace, dependency 또는 문서 계약부터 해결합니다.

기존 코드 저장소는 먼저 구조 탐지 계획을 확인하고 명시적으로 적용합니다.

```bash
pnpm goodz -- adopt --name "새 제품명" --root /path/to/existing-repository
pnpm goodz -- adopt --name "새 제품명" --root /path/to/existing-repository --apply
pnpm goodz -- config migrate --root /path/to/existing-repository --dry-run
pnpm goodz -- config migrate --root /path/to/existing-repository
pnpm goodz -- verify --root /path/to/existing-repository
```

### 2. 프로젝트 정체성 설정

| 순서 | 수정 대상 | 결정할 내용 |
|---|---|---|
| 1 | `goodz.config.json` | edition, Core 설정, 사용할 Reference |
| 2 | `docs/00-process/NORTH_STAR.md` | 무엇을 만들고 무엇을 만들지 않을지 |
| 3 | `docs/01-planning/PRD.md` | 사용자, 문제, 범위와 성공 기준 |
| 4 | `PROJECT.md` | 현재 Sprint, Phase와 저장소 정보 |
| 5 | Reference | Commerce 유지·제거 또는 자체 도메인 Reference 추가 |

새 도메인은 자체 타입과 앱을 만들고 `@goodz/process`는 수정하지 않는 것이 기본입니다. 이식성은 `pnpm check:portability`로 확인합니다.

### 3. 첫 P0부터 P4까지 진행

```text
P0 기획
  intake 작성 → PRD/유저스토리/성공지표 → P0 Gate
P1 디자인
  정보 구조·화면 스펙·handoff → P1 Gate
P2 개발
  bounded-context 타입 → API → 앱 → 문서 동기화
P3 QA
  TEST_PLAN → smoke/회귀 → pnpm verify
P4 배포
  승인 → RELEASE_CHECKLIST → CI/Release/Smoke 증거 연결
```

각 단계가 끝날 때 `docs/00-process/status.json`에 intake, deliverable, approval과 trace link를 연결합니다. 상세 절차는 [Goodz Core Onboarding](./docs/00-process/ONBOARDING.md)과 [WORKFLOW](./docs/00-process/WORKFLOW.md)을 따릅니다.

PRD와 Design 결과 승인 후에는 API의 Project ID로 Git-ready 문서를 생성합니다.

```bash
pnpm goodz -- export --project PRJ-XXXXXXXX --api http://localhost:4000 --root . --dry-run
pnpm goodz -- export --project PRJ-XXXXXXXX --api http://localhost:4000 --root .
pnpm goodz -- verify --root .
```

검토 branch와 Pull Request까지 만들려면 깨끗한 작업 트리에서 실행합니다.

```bash
pnpm goodz -- git publish --project PRJ-XXXXXXXX --root . --dry-run
GOODZ_GITHUB_TOKEN=<token> pnpm goodz -- git publish --project PRJ-XXXXXXXX --root .
```

전체 CLI 명령과 충돌 보호 규칙은 [Goodz CLI](./docs/00-process/CLI.md)를 참고합니다.

### 4. 로컬 실행

```bash
cp apps/web-shop/.env.local.example apps/web-shop/.env.local
cp apps/admin-dashboard/.env.example apps/admin-dashboard/.env
cp apps/process-dashboard/.env.example apps/process-dashboard/.env
pnpm dev
```

| 서비스 | 기본 주소 | 역할 |
|---|---|---|
| Process Dashboard | `http://localhost:5180` | Goodz 운영 화면 |
| API Server | `http://localhost:4000` | Process/Commerce API |
| Web Shop | `http://localhost:3000` | Commerce Reference |
| Admin Dashboard | `http://localhost:5173` | Commerce Reference 운영 UI |
| Internal Service API | `http://localhost:4200` | 별도 실행하는 비커머스 Reference |

## Process Dashboard 사용법

Dashboard는 Git 문서와 외부 증거의 원본을 대체하지 않지만 읽기 전용 화면도 아닙니다. 문서·증거를 보여주는 **운영 projection**과 프로젝트·단계·작업·Gate를 변경하는 **command UI**를 함께 제공합니다.

### 처음 접속했을 때

1. **개요**에서 현재 Sprint, 권장 액션, P0–P4 Operating Map을 확인합니다.
2. **프로젝트**에서 P0–P4 또는 Phase 0–8 Template을 선택하거나 Builder로 팀 템플릿을 만든 뒤 Process Run을 시작합니다.
3. **가이드**에서 사용 매뉴얼과 Workflow를 읽습니다.
4. **우선 처리 작업**에서 아직 완료되지 않은 항목을 확인합니다.

### 프로젝트를 진행할 때

현재 Stage의 Task를 완료하고 필수 산출물에 Owner·URI를 제출해 `승인`으로 바꿉니다. 문서, Issue, PR, Commit, CI, Release 증거는 같은 Stage에 연결합니다. 이 두 조건이 충족되어야 GO가 활성화되고 다음 Stage가 자동 시작됩니다.

| 메뉴 그룹 | 확인하는 것 |
|---|---|
| **Plan** | 기획 입력, 변경 요청, 디자인, PRD/API/QA 등 산출물 원문 |
| **Control** | DACI 승인, Issue/PR/CI/Release 증거, Delivery Metrics와 추적 연결 |
| **System** | Phase Gate, 작업 큐, Reference 기능과 실행 앱 상태 |

### 매일 운영 루프

```text
개요에서 신호 확인
→ 작업 큐 처리
→ 산출물·승인 갱신
→ Commit/CI 증거 동기화
→ 누락 증거 확인
→ verify 후 Gate 판정
```

```bash
pnpm sync:github-trace   # GitHub Issue/PR/Commit/CI/Release 증거 보강
pnpm snapshot:metrics    # 현재 Delivery Metrics 기준점 저장
pnpm check:process       # status·산출물·trace 정합성 검사
pnpm verify              # 전체 품질 Gate
```

프로젝트 실행 상태는 Dashboard의 **프로젝트** 메뉴에서 변경하며 SQLite와 감사 이력에 기록됩니다. 장문 문서와 GitHub/CI 증거는 원본 Markdown·외부 시스템에서 갱신하고, Goodz 자체 개발 현황은 `status.json` projection으로 유지합니다. Incident는 **운영 DB**에서 생성·종료합니다. 전체 메뉴 설명은 [USER_MANUAL](./docs/00-process/USER_MANUAL.md)을 확인합니다.

---

## 이 프로젝트의 핵심 — 풀 프로세스 모노레포 시스템

Goodz 플랫폼은 아래 시스템 레이어로 구성됩니다. Commerce와 Internal Service 앱은 Core의 이식성과 실제 실행 흐름을 검증하는 Reference입니다.

| 시스템 레이어 | 내용 |
|---------------|------|
| **프로세스** | P0–P4, Phase Gate, Sprint ROADMAP |
| **문서 SSOT** | 기획 입력, 변경 요청, PRD, 스펙, API, ADR, QA, DACI 승인, 결정 로그, 추적 링크 |
| **운영 대시보드** | Process Dashboard에서 그룹형 메뉴, 운영 브리핑 개요, Phase, 기획, 변경, 가이드, 산출물 문서 원문, DACI 승인, 증거 누락, 시간 단위 Delivery Metrics, snapshot trend, CI 증거 추적 |
| **운영 저장소** | 문서 SSOT를 유지하면서 SQLite로 문서 인덱스·운영 사건·MTTR을 기록 |
| **모노레포** | Turborepo + pnpm, `@goodz/process` Core와 Commerce Reference 분리 |
| **품질** | `pnpm verify`, CI, GA harness 연동 패턴 |
| **이식성** | Commerce + Internal Service 두 Reference, Core 계약 SHA-256 검증 |
| **AI 협업** | Phase별 스킬, Cursor / Claude Code 역할 분리 |

| 원칙 | 설명 |
|------|------|
| **Phase Gate** | P0→P4 단계마다 산출물·체크리스트를 통과해야 다음 단계로 진행 |
| **Process OS** | 기획 입력 → 변경 요청 → 산출물 레지스트리 → DACI 승인 → Commit/CI 증거 → 대시보드 추적 |
| **문서 = SSOT** | Intake·변경 로그·PRD·API·화면 스펙이 코드보다 먼저, GitHub에서 버전 관리 |
| **타입 우선 개발** | Core는 `@goodz/process`, Commerce Reference는 `@goodz/types`에서 계약 우선 |
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
| P2 | bounded-context 타입 → API → 앱 · `pnpm verify` |
| P3 | TEST_PLAN · GA compliance · `check:process` |
| P4 | RELEASE_CHECKLIST · 배포 · DACI 승인 · CI/CD evidence |

```text
P0 기획          P1 디자인         P2 개발           P3 QA            P4 배포
────────         ────────         ────────         ────────         ────────
Intake/변경       Claude Design    context types    pnpm verify      CI green
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
S0–S20 ✅ Foundation/Operations   S21 ✅ Platform Boundary   S22 ✅ Portability Proof   S23 ✅ Writable Process   S24 ✅ Template Catalog   S25 ✅ Visual Builder   S26 ✅ PRD/Design Workbench   S27 ✅ Design Job/Export   S28 ✅ Git Materializer/CLI   S29 ✅ Repository Adopt   S30 ✅ Template Migration   S31 ✅ Git Connector   S32 ✅ Core v1.0 Gate
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
| Approval Governance | 🟢 Driver·Approver·Contributors·Informed 승인 체계 반영 |
| CI Runtime | 🟢 GitHub Actions Node 24 + 최신 major actions 반영 |
| Evidence Automation | 🟢 GitHub trace sync + 대시보드 누락 경고 반영 |
| Delivery Metrics | 🟢 GitHub timestamp 기반 DORA 베이스라인 + snapshot trend 반영 |
| User Manual | 🟢 대시보드 가이드 메뉴 + 산출물 문서 뷰어 반영 |
| Operator UX | 🟢 그룹형 사이드바 + 행동 중심 Overview 반영 |
| Premium Dashboard UX | 🟢 검색/접힘 사이드바 + Quick jump + 콘솔형 헤더 반영 |
| Design OS | 🟢 디자인 시스템·레퍼런스·와이어프레임·스토리보드 + Design 메뉴 반영 |
| Premium White UI | 🟢 화이트 표면·미세 보더·grouped metrics·Phase flow 반영 |
| Template Onboarding | 🟢 fork 런북·template contract·standalone dependency 반영 |
| White Premium Detail | 🟢 Quick Jump·CTA·metrics·phase·metadata·typography 위계 반영 |
| Sidebar Comfort | 🟢 active disclosure·여백·fixed footer·custom scrollbar 반영 |
| SQLite Operations | 🟢 문서 인덱스·incident/MTTR·영구 디스크 배포 구성 반영 |
| Platform Boundary | 🟢 Goodz Core 모델·Commerce Reference·API 라우터 경계 반영 |
| Portability Proof | 🟢 Internal Service Reference·Core 수정 0건·Commerce 의존 0건 |
| Goodz Core/CLI v1.0 | 🟢 init·adopt·config/template migrate·project·export·Git publish·clean-clone verify |

로드맵: [docs/01-planning/ROADMAP.md](./docs/01-planning/ROADMAP.md)

### 이슈 → 개발 → 배포 흐름

```text
GitHub Issue (기획/기능)
    → feature/* 브랜치
    → PR (Phase 체크리스트 + Closes #N)
    → pnpm verify (로컬) + CI (GitHub Actions)
    → merge → traceLinks 갱신 → Phase Gate 갱신
```

Traceability 운영 기준: [TRACEABILITY.md](./docs/00-process/TRACEABILITY.md) · GitHub sync: [GITHUB_TRACE_SYNC.md](./docs/00-process/GITHUB_TRACE_SYNC.md) · Metrics: [METRICS.md](./docs/00-process/METRICS.md) · 승인 기준: [APPROVALS.md](./docs/00-process/APPROVALS.md) · CI/CD 기준: [CICD.md](./docs/00-process/CICD.md)

---

## 모노레포 — Turborepo + pnpm

Goodz Core와 Goodz Commerce Reference는 같은 모노레포에서 개발하되 타입과 API 모듈 경계를 분리합니다.

```text
Goodz Core
@goodz/process → process route/data → process-dashboard
@goodz/cli     → Process API bundle → docs/projects + hash manifest

Goodz Commerce Reference
@goodz/types   → commerce route/data → web-shop/admin-dashboard

Goodz Internal Service Reference
@goodz/internal-service-types → service catalog API (:4200)

공통
@goodz/ui      → process-dashboard/web-shop/admin-dashboard
```

| 앱 | 스택 | 포트 | 역할 |
|----|------|------|------|
| **web-shop** | Next.js 15 | `:3000` | Goodz Commerce Reference B2C UX |
| **admin-dashboard** | Vite + React | `:5173` | Goodz Commerce Reference 운영 UX |
| **process-dashboard** | Vite + React | `:5180` | **기획·변경·산출물·DACI 승인·추적·Phase 관리** |
| **api-server** | Express + TS + SQLite | `:4000` | process/commerce 라우터를 조립하는 모듈형 런타임 |

| 패키지 | 역할 |
|--------|------|
| `@goodz/process` | Phase, 산출물, 승인, 추적, 지표, Incident 등 **Goodz Core SSOT** |
| `@goodz/cli` | init·project create·safe export·verify와 Git-ready Materializer |
| `@goodz/types` | Product, Cart, Checkout 등 **Commerce Reference SSOT** |
| `@goodz/ui` | Button, Card · Tailwind preset |
| `@goodz/tsconfig` | 공유 TypeScript 설정 |
| `@goodz/internal-service-types` | 비커머스 Reference의 Service/Owner/Tier 계약 |

### 실행 가능한 Reference

| Reference | 도메인 | 목적 |
|---|---|---|
| Goodz Commerce Reference | commerce | B2C·운영 UI와 E2E 타입 패턴 |
| Goodz Internal Service Reference | internal-platform | Core 수정 없이 자체 타입·API·P0–P4 도입 증명 |

두 번째 Reference의 상세 구조와 실행법은 [references/internal-service](./references/internal-service/README.md), 검증 기준은 [PORTABILITY.md](./docs/00-process/PORTABILITY.md)를 확인합니다.

### 기능 추가 순서 (P2 규칙)

```text
① packages/process 또는 packages/types ← bounded context 타입 먼저
② apps/api-server/src/routes/{process,commerce}.ts ← 해당 API
③ packages/ui          ← 공통 UI (필요 시)
④ apps/web-shop / admin-dashboard
⑤ 승인 bundle → goodz export → Git-ready Markdown
⑥ docs/API.md 갱신 + pnpm verify
```

### 모노레포 품질 게이트

| 검사 | 명령 | 역할 |
|------|------|------|
| 워크스페이스 일관성 | `pnpm check:workspace` | manypkg |
| 유령 의존성 | `pnpm check:deps` | depcheck |
| Process OS 정합성 | `pnpm check:process` | status.json · 산출물 · traceLinks |
| CLI Materializer | `pnpm check:cli` | 경로 보안 · 충돌 보호 · manifest 무결성 |
| Template 계약 | `pnpm check:template` | 필수 경로 · env example · portable dependency |
| Core 이식성 | `pnpm check:portability` | Core hash · 독립 타입 · 비커머스 P0–P4 증거 |
| SQLite 운영 저장소 | `pnpm check:sqlite` | migration · 문서 seed · incident · project/task/gate lifecycle · audit |
| GitHub 증거 동기화 | `pnpm sync:github-trace` | commit → CI/PR/Issue/Release 보강 |
| Metrics snapshot | `pnpm snapshot:metrics` | Delivery Metrics 기준점 저장 |
| 빌드 + 린트 | `turbo build && turbo lint` | Turborepo computational cache |
| **전체** | **`pnpm verify`** | PR·커밋 전 필수 |

- pnpm `node-linker=isolated` — 유령 의존성 방지
- CI: `.turbo/cache` 복원 + [ga-analytics-harness](https://github.com/dayainow/ga-analytics-harness) 형제 checkout

ADR: [001 — Turborepo + pnpm 선택](./docs/03-engineering/ADR/001-monorepo-turborepo.md) · [002 — SQLite 운영 저장소](./docs/03-engineering/ADR/002-sqlite-operations-store.md) · [004 — Writable Process Control Plane](./docs/03-engineering/ADR/004-writable-process-control-plane.md)

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
│   ├── 00-process/            # WORKFLOW · PHASE_GATES · APPROVALS · DECISIONS · TRACEABILITY · CICD
│   ├── 01-planning/           # intake/ · changes/ · PRD · USER_STORIES · ROADMAP · GA4
│   ├── 02-design/             # CLAUDE_DESIGN · DESIGN_SYSTEM · screens/
│   ├── 03-engineering/        # ARCHITECTURE · API · ADR
│   ├── 04-qa/                 # TEST_PLAN · RELEASE_CHECKLIST
│   └── deliverables/          # 산출물 레지스트리
├── skills/                    # goodz-planning · design · dev
├── apps/                      # web-shop · admin-dashboard · process-dashboard · api-server
├── packages/                  # process(Core) · types(Commerce Reference) · ui · tsconfig
├── references/                # internal-service 등 독립 Reference
├── goodz.config.json          # 플랫폼/Reference 경계 계약
├── schemas/                   # Goodz 설정 JSON Schema
├── render.yaml                # Process OS 단일 서비스 + 영구 디스크 Blueprint
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
pnpm verify       # workspace + deps + process + template + build + lint (PR 전 필수)
pnpm check:process # status.json · 산출물 · traceLinks 검증
pnpm check:template # fork 필수 경로 · 설정 · portable dependency 검증
pnpm check:portability # Core 무변경 · 비커머스 Reference 독립성 검증
pnpm check:sqlite  # SQLite migration · seed · incident/MTTR 검증
pnpm sync:github-trace # GitHub CI/PR/Issue/Release 증거 동기화
pnpm smoke:staging # API + 3개 화면 smoke check
pnpm smoke:process-os # 배포된 단일 Process OS health + DB + 화면 검증
```

Node.js 22.13 이상이 필요하며 배포 런타임은 Node 24를 사용합니다. 로컬 SQLite 파일은 기본적으로 `data/goodz.db`에 생성됩니다.

### 환경 변수

| 파일 | 변수 |
|------|------|
| `apps/web-shop/.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:4000` |
| `apps/admin-dashboard/.env` | `VITE_API_URL=http://localhost:4000` |
| `apps/process-dashboard/.env` | `VITE_API_URL=http://localhost:4000` |
| `apps/api-server` | `GOODZ_DB_PATH=data/goodz.db`, `GOODZ_DB_DURABILITY=local` |
| 외부 Process OS | `GOODZ_BASIC_AUTH_USER`, `GOODZ_BASIC_AUTH_PASSWORD` |

스테이징 배포 절차와 smoke URL override는 [STAGING_RUNBOOK.md](./docs/04-qa/STAGING_RUNBOOK.md)를 기준으로 합니다.
새 저장소로 fork하는 절차는 [ONBOARDING.md](./docs/00-process/ONBOARDING.md)를 기준으로 합니다.

### Process OS 배포

[Render Blueprint로 배포](https://render.com/deploy?repo=https://github.com/dayainow/goodz)하면 Process Dashboard와 API가 같은 도메인에서 실행됩니다. `render.yaml`은 SQLite 보존을 위해 1GB 영구 디스크가 포함된 유료 `starter` 플랜을 사용합니다. 비용이 없는 임시 파일시스템 배포에서는 재시작 시 운영 사건이 사라질 수 있습니다.

운영 구조와 백업 기준은 [OPERATIONS_STORE.md](./docs/00-process/OPERATIONS_STORE.md)를 확인하세요.

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
Process    Phase Gate · Process OS · Traceability · DACI Approval · Decision Log
Monorepo   Turborepo · pnpm workspaces · @goodz/process + context SSOT
Frontend   Next.js 15 · React 19 · Vite · Tailwind CSS
Backend    Express · TypeScript · node:sqlite
Quality    pnpm verify · check:process · Turbo cache · GitHub Actions Node 24 · GA harness
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
