# 프로세스 모니터링 대시보드

> **Goodz 시스템 제품**의 진행도와 사용자 Process Run을 관리하는 Control Plane UI

## 왜 필요한가

Goodz의 진짜 제품은 쇼핑몰이 아니라 **P0–P4 풀 프로세스 시스템**입니다.  
Phase Gate·Sprint·기획 입력·산출물·기능 백로그·개발 증거를 **한 화면에서 관리**해야 에이전트·PM이 상태를 공유할 수 있습니다.

## 아키텍처

```text
docs/00-process/status.json              ← SSOT (수동·에이전트 갱신)
docs/00-process/metrics-snapshots.json   ← Metrics trend snapshot
SQLite schema v5                         ← Project·PRD·Design Pack·Design Job·Run·Stage·Task·Deliverable·Evidence·Gate·Audit SSOT
        │
        ▼ GET /api/process/status
        ▼ GET /api/process/metrics-snapshots
        ▼ GET /api/process/document?path=...
api-server (:4000)
        │
        ▼ fetch
process-dashboard (:5180)       ← Projection + Command UI
```

| 레이어 | 역할 |
|--------|------|
| `status.json` | Phase·Sprint·기획 입력·기획 변경·산출물·DACI 승인·추적 링크·기능·앱 목록의 기계 판독 가능 상태 |
| `metrics-snapshots.json` | Delivery Metrics 추세를 위한 저장 시점별 기준점 |
| SQLite | 프로젝트 실행 상태, Gate 결정, Incident와 감사 이력 |
| `@goodz/process` | `ProcessStatus` 타입 SSOT |
| `api-server` | 문서 projection 조회와 Process command API 제공 |
| `process-dashboard` | 프로젝트 생성·단계·작업·Gate command와 기존 문서·증거 projection |

## 접속

```bash
pnpm dev
# http://localhost:5180
```

API 단독 확인:

```bash
curl http://localhost:4000/api/process/status
curl http://localhost:4000/api/process/metrics-snapshots
curl "http://localhost:4000/api/process/document?path=docs/00-process/USER_MANUAL.md"
```

## status.json 갱신 규칙

작업 완료 시 **함께 갱신**:

1. `docs/00-process/status.json` — 해당 항목 `status` · `progress`
2. `PHASE_GATES.md` / `PROJECT.md` / `ROADMAP.md` — 사람이 읽는 문서
3. 대시보드에서 반영 확인 (새로고침 또는 30초 대기)

### status 값

| 값 | 의미 |
|----|------|
| `done` | 완료 |
| `in_progress` | 진행 중 |
| `pending` | 미착수 |
| `blocked` | 차단됨 |

## UI 구성

- **Workspace / 프로젝트** — 사용자 프로젝트·PRD·Design Pack·Run·Task·산출물·Evidence·Gate command
- **Library / 가이드** — 프로젝트 공용 매뉴얼과 운영 기준
- **Goodz Reference / 시스템 개요** — Goodz Sprint 목표·오늘 볼 신호·P0-P4 운영 지도
- **Goodz Reference / 기획** — Goodz 자체 입력 요청·출처·다음 액션
- **변경** — 기획 수정 요청·대상 문서·반영 상태
- **디자인** — 디자인 시스템, 레퍼런스, 와이어프레임, 스토리보드
- **가이드** — 서비스 이용 매뉴얼, 에이전트 가이드, 워크플로우, Metrics, CI/CD 문서 원문
- **산출물** — PRD·화면설계·API·QA·릴리스 문서 레지스트리
- **승인** — Driver·Approver·Contributors·Informed·승인 기준·결정 로그
- **증거** — Issue/PR/Commit/CI/승인/릴리즈·스모크 누락 경고
- **지표** — DORA 원형 지표, Goodz delivery health, snapshot trend, 요청→커밋→CI→증거 시간
- **추적** — 기획·변경·산출물·승인과 Issue/PR/Commit/CI/Release 증거 연결
- **Phase Gate** — P0–P4 패널 + 문서 경로

가이드와 산출물의 Markdown 원문은 GFM으로 렌더링합니다. 제목·본문은 대시보드 sans 폰트를 상속하고, 표·목록·인용·굵게·링크·코드만 각 의미에 맞는 스타일을 사용합니다. 원시 Markdown 기호를 그대로 노출하지 않습니다.
산출물 화면은 데스크톱에서 목록과 sticky 문서 뷰어를 나란히 배치합니다. 작은 화면에서는 `문서 보기`를 누르면 뷰어 위치로 자동 이동하고, 선택된 버튼은 `열린 문서` 상태를 표시합니다.
- **작업 큐** — 차단/진행/대기/완료 상태별 항목
- **기능** — F-01… 기능 백로그 테이블
- **앱** — 4앱 포트·역할·바로가기

## 사이드바 정보 구조

메뉴가 많아졌기 때문에 v0.11부터 기능 목록을 단순 나열하지 않고 업무 흐름별로 묶습니다. 현재 구조는 사용자 프로젝트와 Goodz 자체 개발 기록의 소유권 경계를 우선합니다.

| 그룹 | 메뉴 | 의도 |
|------|------|------|
| Workspace | 프로젝트 | 사용자 프로젝트 생성과 실행, Operations DB command |
| Library | 가이드 | 모든 프로젝트가 공유하는 사용법과 운영 기준 |
| Goodz Reference | 시스템 개요, 기획, 변경, 디자인, 산출물, 승인, 증거, 지표, 추적, Phase Gate, 작업 큐, 기능, 운영 DB, 앱 | Goodz 자체 개발 기록과 Git SSOT 진단 |

### v0.12 Sidebar UX

- **메뉴 검색**: `label`, `eyebrow`, 설명 문구를 기준으로 메뉴를 필터링합니다.
- **Quick jump**: 프로젝트와 가이드만 상단에 고정해 일반 사용자를 Workspace에 유지합니다.
- **접힘 그룹**: Goodz Reference는 기본적으로 접고, 관리자가 선택했을 때만 펼칩니다.
- **범위 표시**: 사이드바 하단에서 Workspace의 Operations DB와 Goodz Reference의 Git 문서를 구분합니다.

## Design 메뉴

v0.13부터 Design 메뉴는 `status.json`의 `designReferences`, `wireframes`, `storyboards`를 읽습니다.

- **Reference Board**: 외부 디자인 시스템의 차용점, 적용 화면, 원문 링크
- **Wireframes**: 화면별 저해상도 정보 구조와 연결 레퍼런스
- **Storyboards**: 사용자 여정과 handoff 기준
- **Design System**: `docs/02-design/DESIGN_SYSTEM.md`와 `DESIGN_OS.md`를 기준으로 운영

## Overview UX 기준

- 숫자 카드보다 먼저 `Start here`, `Next signal`, `Health` 액션을 제시합니다.
- evidence issue가 있으면 증거 메뉴로 자연스럽게 이동할 수 있어야 합니다.
- P0-P4 진행 상태는 개요에서 바로 볼 수 있어야 합니다.
- 기존 status, trace, metrics 데이터 모델은 유지하고 화면 구성만 더 운영자 친화적으로 만듭니다.
- 메인 헤더는 현재 섹션 설명, sprint, system version, updated date를 보여주는 command header 역할을 합니다.

## v0.14 Premium White UI 기준

사용자 피드백 기준: 기존 화이트 + pastel 3색 카드 조합은 generic SaaS 템플릿처럼 보일 수 있으므로, v0.14부터 운영 대시보드의 기본 표면을 더 절제된 화이트 테마로 정리합니다.

- **표면**: 일반 카드 배경은 `white` 또는 `#FAFAFA`로 통일하고, 구분은 `1px #E5E5E5` 수준의 미세 보더와 낮은 shadow로 처리합니다.
- **그림자**: 카드 depth는 `0 1px 3px rgba(0,0,0,0.04)` + `0 8px 24px rgba(0,0,0,0.04)` 계열만 사용합니다.
- **색상**: primary accent는 brand violet과 near-black 중심으로 제한하고, emerald/amber/rose는 상태 신호(success/warning/risk)에만 사용합니다.
- **타이포**: 화면 제목은 24-32px/600-700, metadata는 12-13px/#737373 계열로 낮춰 정보 우선순위를 분리합니다.
- **메트릭**: `PHASE 5/5` 같은 pill을 한 줄에 펼치지 않고 Completion, Delivery Health, Operations 그룹 카드로 묶습니다.
- **Phase flow**: P0-P4는 동일한 독립 카드가 아니라 선형 flow로 보여주고, 완료 단계는 채움 스타일, 현재 단계는 보더 강조로 구분합니다.
- **사이드바**: light gray sidebar + white panels로 본문과 분리하고, active item은 near-black fill로 확실하게 표시합니다.

## v0.16 White Premium Detail Tuning

- **Quick Jump**: active는 near-black fill, inactive는 zinc-600 텍스트와 zinc-300 outline을 사용해 양쪽 상태 모두 읽히게 합니다.
- **Action hierarchy**: Start here는 violet-50 표면과 2단 shadow, Next signal은 white + border, Health는 큰 건강도 숫자로 구분합니다.
- **Metric semantics**: Completion은 작은 완료 badge, Delivery Health는 비율 중심, Operations는 0 대신 대기열 없음 같은 문장으로 표현합니다.
- **Current phase**: P0-P4 중 현재 운영 단계는 violet ring과 현재 운영 badge로 표시합니다.
- **Metadata**: Sprint를 가장 강하게, Version은 mono, Updated는 muted, Section은 badge로 분리합니다.
- **Micro interaction**: 핵심 action/metric/phase card만 4px lift를 사용하고 표·문서 컨테이너는 움직이지 않습니다.
- **Typography**: Noto Sans KR → Pretendard → system-ui 순서로 사용하며 heading 1.15, body 1.5 line-height를 적용합니다.
- **Navigation cue**: 접힘 그룹은 회전하는 chevron과 항목 수를 함께 보여줍니다.

브라우저 육안 QA에서는 1440px 데스크톱과 1024px 이하 반응형에서 CTA 높이, metadata 줄바꿈, Operating map ring 잘림을 확인합니다.

## v0.17 Sidebar Comfort

- **Layout**: sidebar는 360px, 좌우 20px padding을 사용하고 header, summary, navigation, footer를 분리합니다.
- **Disclosure**: 현재 메뉴가 속한 그룹만 자동으로 열며 Plan, Control, System은 초기 접힘 상태로 시작합니다.
- **Accordion**: 한 번에 한 그룹만 열고, 활성 메뉴가 든 그룹도 사용자가 직접 접을 수 있습니다. 다른 섹션으로 이동하면 새 활성 그룹만 자동으로 열립니다.
- **Search disclosure**: 검색 중에는 일치하는 그룹을 임시로 펼치고, 검색을 지우면 마지막으로 열어 둔 단일 그룹 상태로 돌아갑니다.
- **Surface**: 그룹 외곽 카드와 메뉴 카드의 중첩을 제거하고 section divider로 그룹 경계를 표현합니다.
- **Scroll area**: navigation만 min-height 0, flex 1, overflow-y auto로 스크롤하고 SSOT footer는 고정합니다.
- **Scrollbar**: 8px 폭, zinc-200 track, zinc-400 thumb, 48px minimum thumb, stable gutter를 사용합니다.
- **Spacing**: navigation 오른쪽 12px, 아래 32px 여백을 두어 thumb와 마지막 메뉴가 경계에 붙지 않게 합니다.

## v0.18 SQLite Operations

- **운영 메뉴**: System 그룹에서 Open incident, MTTR, indexed docs를 확인합니다.
- **책임 분리**: Phase·승인·산출물은 문서 SSOT, 사건·종료 시각은 SQLite 실행 계층으로 구분합니다.
- **Incident workflow**: severity와 설명으로 사건을 생성하고 타임라인에서 종료합니다.
- **Durability cue**: storage durability와 schema version을 노출해 영구 디스크 누락을 발견할 수 있게 합니다.
- **Deployment**: 프로덕션에서는 API가 대시보드 정적 빌드를 같은 origin으로 제공합니다.

## v0.21 Writable Process MVP

- **프로젝트 생성**: 이름, 목표, Owner와 Template을 선택해 Process Run을 시작합니다.
- **Template instance**: 기본 P0–P4 정의를 Stage·Task·Gate 실행 인스턴스로 복제합니다.
- **Task command**: 상태와 담당자를 Dashboard에서 변경합니다.
- **Stage command**: 단계를 시작하거나 차단할 수 있습니다.
- **Gate command**: GO/HOLD/KILL 결정과 근거를 기록합니다.
- **Guard**: 모든 Task가 완료되지 않으면 GO를 거부합니다.
- **Automatic advance**: GO 시 현재 Stage를 완료하고 다음 Stage를 자동 시작합니다.
- **Audit**: 프로젝트 생성과 모든 상태 변경을 append-only 이력으로 표시합니다.
- **SSOT 분리**: 장문 문서·증거는 Git, 가변 Process Run은 SQLite가 기준입니다.

## v0.22 Process Template Catalog

- **파일 기반 Catalog**: `templates/process/*.json`이 기본 Template 정의의 SSOT입니다.
- **기본 Template 2종**: 제품 전달 P0–P4와 서비스 전달 Phase 0–8을 제공합니다.
- **Template Builder**: Dashboard에서 구조화된 폼으로 정의를 검증·저장하고 즉시 새 프로젝트에 사용합니다.
- **Deliverable command**: Stage별 산출물 상태, Owner, URI와 검토 메모를 저장합니다.
- **Evidence command**: 문서, Issue, PR, Commit, CI, Release 링크를 현재 Stage에 연결합니다.
- **Gate guard**: 모든 Task 완료와 모든 필수 산출물 승인 전에는 GO를 거부합니다.

## v0.23 Visual Template Builder

- **No JSON required**: 사용자는 원시 JSON을 편집하지 않고 Template 이름과 Stage 구조를 폼에서 작성합니다.
- **Structured editing**: Stage·Task·Deliverable을 추가·삭제하고 Stage 순서를 위/아래로 이동합니다.
- **Clone workflow**: Catalog의 기본/사용자 Template을 복제해 새 버전 후보를 만듭니다.
- **Live Blueprint**: Stage, Task, 필수 산출물 수와 단계 흐름을 편집 중 즉시 확인합니다.
- **Inline validation**: 중복/잘못된 Stage code, 누락 필드와 빈 Task를 저장 전에 안내합니다.
- **API guard**: 최대 20 Stage, Stage당 50 Task·20 Deliverable과 필드 길이를 서버에서도 검증합니다.

## v0.24 PRD & Design Workbench

- **Guided PRD**: 문제, 사용자, 핵심 가치, MVP, 비목표, 성공 지표와 제약을 질문형으로 작성합니다.
- **Markdown projection**: 입력을 검토 가능한 PRD Markdown으로 즉시 합성합니다.
- **Approval reset**: 승인된 PRD나 Design Pack을 수정하면 Draft로 돌아가 재승인을 요구합니다.
- **Wireframe spec**: 화면마다 목적, 주요 영역과 primary action을 정의합니다.
- **Storyboard**: Actor, Action, Screen, Outcome을 순서대로 기록합니다.
- **Concept**: 디자인 방향, 무드, 팔레트와 타이포그래피를 잠급니다.
- **Claude handoff**: PRD와 Design Pack을 하나의 Claude Design prompt로 합성하고 결과 URL을 연결합니다.
- **Design guard**: PRD 승인 전 또는 화면·스토리보드·콘셉트·결과 URL 누락 시 Design 승인을 거부합니다.

## v0.25 Design Job Connector & Export

- **Stateful handoff**: handoff를 `queued → in_progress → submitted → approved` Job으로 관리합니다.
- **Prompt snapshot**: Job 생성 시점의 승인 PRD와 Design Pack prompt를 고정합니다.
- **Review loop**: 제출 결과에 수정 요청을 남기고 새 Job으로 재작업할 수 있습니다.
- **Stale guard**: PRD나 Design Pack 변경 시 열려 있는 Job은 자동으로 `changes_requested`가 됩니다.
- **Portable export**: 최종 승인 후 PRD, Design Pack, Claude handoff Markdown 3건을 JSON bundle로 내려받습니다.
- **Connector boundary**: v0.25 기본값은 수동 Claude Design 어댑터이며, 자동 MCP/API 어댑터는 같은 Job 계약을 사용합니다.

## v0.26 Git Materializer & Goodz CLI

- **Local authority**: Dashboard/API는 portable bundle을 제공하고 실제 저장소 쓰기는 사용자 환경의 CLI가 담당합니다.
- **Safe materialize**: `docs/projects/` Markdown과 `.goodz/exports` hash manifest를 생성합니다.
- **Conflict guard**: 마지막 export 이후 사용자가 수정한 파일은 기본적으로 덮어쓰지 않습니다.
- **Path guard**: 절대·상위 경로와 symbolic link write를 거부합니다.
- **Command loop**: `goodz init`, `project create`, `export`, `verify`로 초기화부터 산출물 검증까지 연결합니다.

## Workspace / Goodz Reference Boundary

- **Default entry**: Dashboard의 초기 섹션은 시스템 개요가 아니라 사용자 `프로젝트`입니다.
- **Workspace**: SQLite/PostgreSQL에 저장되는 사용자 Project·PRD·Design Pack·Run·Task·Deliverable·Evidence·Gate를 포함합니다.
- **Library**: 프로젝트 공용 매뉴얼과 운영 기준만 제공합니다.
- **Goodz Reference**: `status.json`과 Git 문서에서 읽은 IN·CR·DR·TL·Sprint·Metrics를 접힌 관리자 영역으로 격리합니다.
- **Scope cue**: Reference 화면은 사용자 프로젝트 데이터가 아니라는 경고와 프로젝트 복귀 동선을 항상 표시합니다.
- **Header metadata**: Workspace에서는 Goodz Sprint 대신 프로젝트·활성 Run·Operations DB 범위를 표시합니다.
- **Workbench continuity**: PRD/Design command 갱신은 같은 프로젝트 Workbench를 재마운트하지 않아 활성 탭과 스크롤 맥락을 유지합니다.

## Redesign PRD v1.0

- Hero는 trace coverage와 전체 진행률을 한 surface에서 비교합니다.
- Sidebar 메뉴는 모든 viewport에서 1컬럼을 유지하며 active item은 violet 3px indicator로 구분합니다.
- START HERE는 흰 surface, violet indicator, L2 shadow로 강조하고 장식용 violet tint는 사용하지 않습니다.
- Overview metric은 Completion과 Delivery Health만 유지하고 Queue는 Hero에서 자연어로 표현합니다.
- core surface는 16px radius, L1/L2 shadow, 150ms transition을 사용합니다.
- 키보드 focus-visible과 prefers-reduced-motion을 전역 기준으로 적용합니다.
- 선택된 문서 항목은 hover에서도 dark surface와 white text 대비를 유지합니다.

상세 AC: [PRD-PROCESS-DASHBOARD-REDESIGN.md](../01-planning/PRD-PROCESS-DASHBOARD-REDESIGN.md)

## 참고한 UI 레퍼런스

- Atlassian Design System — Side navigation: 제품 영역 안에서 중첩 뷰와 섹션 이동을 다루는 좌측 내비게이션 패턴
- IBM Carbon — UI shell left panel: 5개 이상의 보조 항목을 자주 전환할 때 고정 left panel을 쓰는 패턴, 3단계 이상 깊이는 탭/본문으로 분리하는 원칙
- Material Design — Navigation drawer: 주요 목적지 이동과 앱 구조를 담는 내비게이션 서피스 원칙

## 관련 문서

- [NORTH_STAR.md](./NORTH_STAR.md)
- [PHASE_GATES.md](./PHASE_GATES.md)
- [APPROVALS.md](./APPROVALS.md)
- [DECISIONS.md](./DECISIONS.md)
- [TRACEABILITY.md](./TRACEABILITY.md)
- [GITHUB_TRACE_SYNC.md](./GITHUB_TRACE_SYNC.md)
- [METRICS.md](./METRICS.md)
- [CICD.md](./CICD.md)
- [DESIGN_OS.md](../02-design/DESIGN_OS.md)
- [REFERENCES.md](../02-design/REFERENCES.md)
- [deliverables/README.md](../deliverables/README.md)
- [PROJECT.md](../../PROJECT.md)
