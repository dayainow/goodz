# 의사결정 로그

Goodz Process OS의 중요한 결정은 승인 로그와 함께 이 문서에 남깁니다.  
`APPROVALS.md`가 **누가 승인했는가**를 다룬다면, 이 문서는 **왜 그렇게 결정했는가**를 설명합니다.

## 결정 목록

| ID | 날짜 | 결정 | 연결 |
|----|------|------|------|
| DEC-001 | 2026-07-10 | Goodz를 쇼핑몰 데모가 아니라 풀 프로세스 모노레포 시스템으로 정의 | NORTH_STAR |
| DEC-002 | 2026-07-10 | 기획 입력은 대시보드 직접 편집보다 문서 기반 입력으로 유지 | CR-001 |
| DEC-003 | 2026-07-10 | Process OS 산출물을 Issue/PR/Commit/CI 증거와 연결 | CR-002, TL-002 |
| DEC-004 | 2026-07-10 | 승인 로그를 DACI 역할과 승인 기준 중심으로 고도화 | CR-003, AP-003 |
| DEC-005 | 2026-07-13 | v0.6 착수 전 ROADMAP 정합성과 CI Node 24 런타임을 먼저 정리 | CR-004, AP-004 |
| DEC-006 | 2026-07-13 | GitHub 증거는 자동 동기화하고 누락 증거는 대시보드에서 경고 | CR-005, TL-005 |
| DEC-007 | 2026-07-13 | DORA/Delivery Metrics는 날짜 단위 베이스라인부터 시작 | CR-006, TL-006 |
| DEC-008 | 2026-07-13 | Delivery Metrics를 GitHub timestamp 기반 시간 단위로 고도화 | CR-007, TL-007 |
| DEC-009 | 2026-07-13 | Delivery Metrics snapshot을 저장하고 추세 그래프를 제공 | CR-008, TL-008 |
| DEC-010 | 2026-07-13 | 문서와 이용 매뉴얼을 대시보드 안에서 읽기 전용으로 제공 | CR-009, TL-009 |
| DEC-011 | 2026-07-13 | 사이드 메뉴와 개요 화면을 운영자 브리핑 구조로 고도화 | CR-010, TL-010 |
| DEC-012 | 2026-07-13 | 사이드바 검색·접힘과 콘솔형 헤더로 대시보드 UI를 고급화 | CR-011, TL-011 |
| DEC-013 | 2026-07-13 | 디자인 시스템·레퍼런스·와이어프레임·스토리보드를 Design OS로 통합 | CR-012, TL-012 |
| DEC-014 | 2026-07-13 | 프로세스 대시보드 기본 UI를 Premium White 운영 콘솔 테마로 정리 | CR-013, TL-013 |
| DEC-015 | 2026-07-13 | v1.0 전에 온보딩 계약과 standalone 설치 기반을 v0.15로 검증 | CR-014, TL-014 |
| DEC-016 | 2026-07-13 | 화이트 프리미엄 UI는 동일 카드 반복보다 역할별 시각 무게로 계층화 | CR-015, TL-015 |
| DEC-017 | 2026-07-13 | 사이드바는 활성 그룹 자동 열기와 단일 스크롤 영역으로 운영 | CR-016, TL-016 |
| DEC-018 | 2026-07-13 | 문서 SSOT는 유지하고 가변 운영 데이터만 SQLite 실행 계층에 저장 | CR-017, TL-017 |
| DEC-019 | 2026-07-13 | 리디자인 색상은 장식용 pastel을 제거하고 상태 badge와 active indicator에만 사용 | CR-018, TL-018 |
| DEC-020 | 2026-07-14 | 기본 프로세스 정의를 Core에서 파일 기반 Catalog로 분리하고 필수 산출물 승인을 GO 조건에 포함 | CR-021, TL-021 |
| DEC-021 | 2026-07-14 | Template 생성의 기본 UX를 JSON 입력에서 구조화된 Visual Builder와 복제 편집으로 전환 | CR-022, TL-022 |
| DEC-022 | 2026-07-14 | Goodz는 PRD·MVP 디자인 준비와 검증을 맡고 high-fidelity 제작은 Claude Design handoff로 분리 | CR-023, TL-023 |
| DEC-023 | 2026-07-14 | Claude Design 실행은 상태 있는 Job으로 추적하고 Core 기본 Connector는 수동 어댑터로 제공 | CR-024, TL-024 |

## DEC-004 — DACI 승인 체계

### 배경

기존 승인 로그는 `approver`, `approvedAt`, `status` 중심이라 실무에서 누가 준비했고 누가 의견을 냈으며 누구에게 공유됐는지 확인하기 어렵습니다.

### 결정

승인 레코드에 아래 필드를 추가합니다.

- `driver`
- `contributors`
- `informed`
- `criteria`
- `decision`
- `traceLinkIds`

### 영향

- 대시보드 승인 메뉴에서 책임자와 최종 승인자가 분리됩니다.
- `pnpm check:process`가 승인 기준과 trace link 참조를 검증합니다.
- 스프린트, Gate, 릴리스 승인 흐름을 같은 데이터 모델로 관리합니다.

### 후속 액션

- 신규 Issue/PR 생성 시 approval과 trace link를 먼저 연결합니다.
- v0.6에서 승인 지연, 재승인, reviewer 자동 연결을 검토합니다.

## DEC-005 — ROADMAP 정합성 + CI Node 24

### 배경

`ROADMAP.md` 일부에 과거 스프린트 상태와 현재 단계 표현이 남아 있었고, GitHub Actions에서는 Node 20 deprecation 경고가 발생했습니다.

### 결정

v0.6 자동 연결 작업에 들어가기 전에 문서 정합성과 CI 런타임을 먼저 정리합니다.

- ROADMAP의 시스템 버전과 스프린트 타임라인을 v0.5.1 기준으로 갱신
- GitHub Actions를 Node 24와 최신 major actions로 전환
- 변경을 `TL-004`로 추적

### 영향

- 다음 작업자가 현재 위치를 빠르게 파악할 수 있습니다.
- CI 경고를 줄이고 추후 액션 런타임 변경 리스크를 낮춥니다.
- v0.6 GitHub Issue/PR 자동 연결 작업의 기반이 정리됩니다.

## DEC-006 — GitHub Trace Sync + Evidence Alerts

### 배경

`traceLinks`에 Issue/PR/CI 정보를 매번 손으로 넣으면 누락과 오래된 링크가 생기기 쉽습니다. 또 대시보드가 진행률만 보여주면, 실제 운영에 필요한 증거가 빠져 있어도 바로 알아차리기 어렵습니다.

### 결정

- `pnpm sync:github-trace`로 commit SHA 기준 CI run, PR, Issue, Release를 동기화합니다.
- process-dashboard에 `증거` 메뉴를 추가해 누락 항목을 필수/권장/릴리스 전으로 나눠 표시합니다.
- Release URL 또는 `traceLinks[].smoke`를 배포 증거로 인정합니다.

### 영향

- 운영자가 trace link의 빈칸을 빠르게 발견할 수 있습니다.
- `pnpm verify`는 로컬 정합성, `sync:github-trace`는 네트워크 기반 GitHub 증거 보강으로 역할이 분리됩니다.
- 다음 고도화인 DORA/Delivery Metrics의 원천 데이터가 생깁니다.

## DEC-007 — Delivery Metrics Baseline

### 배경

v0.6에서 traceLinks, CI run, smoke 증거가 모이기 시작했습니다. 이 증거를 운영자가 해석하지 못하면 대시보드는 상태표에 머물고, 병목이나 품질 신호를 빠르게 판단하기 어렵습니다.

### 결정

- v0.7은 DORA 원형 지표를 Goodz 데이터에 맞춰 날짜 단위 베이스라인으로 계산합니다.
- 대시보드 `지표` 메뉴에서 배포 빈도, 리드타임, CI 성공률, 변경 실패율, MTTR을 표시합니다.
- Evidence completeness, smoke pass rate, trace coverage를 Goodz 보조 지표로 함께 표시합니다.

### 영향

- 현재 delivery health를 한 화면에서 볼 수 있습니다.
- 지표의 한계를 문서에 명시해 과도한 해석을 막습니다.
- 다음 단계에서 GitHub timestamp를 저장하면 시간 단위 리드타임과 MTTR로 확장할 수 있습니다.

## DEC-008 — Timestamp Metrics

### 배경

v0.7은 날짜 단위 베이스라인이라 같은 날 처리된 작업이 모두 `0d`처럼 보일 수 있습니다. 운영자가 실제 병목을 보려면 요청에서 커밋까지, 커밋에서 CI 성공까지, CI에서 smoke/release 증거까지의 시간이 분리되어야 합니다.

### 결정

- `sync:github-trace`가 commit, CI run, PR, Issue, Release timestamp를 `traceLinks`에 저장합니다.
- Metrics 대시보드는 `요청→커밋`, `커밋→CI`, `CI→증거`, `전체` 시간을 표시합니다.
- 날짜만 있는 기존 기록은 fallback으로 처리해 과거 데이터가 깨지지 않게 합니다.

### 영향

- Delivery Metrics가 날짜 단위 상태표에서 시간 단위 병목 분석으로 올라갑니다.
- CI가 빠른지, smoke/release 증거가 늦는지 분리해 볼 수 있습니다.
- MTTR과 PR review lead time을 계산할 기반이 생깁니다.

## DEC-009 — Metrics Snapshots

### 배경

v0.8은 현재 상태의 Delivery Metrics를 시간 단위로 보여주지만, 시간이 지나며 좋아지고 있는지 나빠지고 있는지는 알기 어렵습니다. 실제 운영에서는 단일 숫자보다 추세가 더 중요합니다.

### 결정

- `pnpm snapshot:metrics`로 현재 Delivery Metrics를 `docs/00-process/metrics-snapshots.json`에 저장합니다.
- API 서버는 `/api/process/metrics-snapshots` endpoint로 snapshot 데이터를 제공합니다.
- Process Dashboard `지표` 메뉴는 저장된 snapshot을 lead time, CI success, evidence completeness, trace coverage 추세 그래프로 표시합니다.

### 영향

- 스프린트별/주간별 delivery health 변화를 비교할 수 있습니다.
- `status.json`은 현재 상태, `metrics-snapshots.json`은 과거 기준점이라는 역할이 분리됩니다.
- 다음 단계에서 incident/MTTR과 PR review lead time을 snapshot에 함께 저장할 수 있습니다.

## DEC-010 — Docs Viewer + User Manual

### 배경

대시보드가 상태와 지표를 보여줘도, 새 운영자나 협업 에이전트가 사용법을 모르면 문서를 다시 파일 트리에서 찾아야 합니다. 실제 서비스처럼 쓰려면 화면 안에서 매뉴얼과 산출물 원문을 확인할 수 있어야 합니다.

### 결정

- `docs/00-process/USER_MANUAL.md`를 서비스 이용 매뉴얼로 추가합니다.
- API 서버는 `GET /api/process/document?path=...`로 `docs/**/*.md` 파일을 읽기 전용으로 제공합니다.
- Process Dashboard에 `가이드` 메뉴를 추가하고, `산출물` 메뉴에서 deliverable 문서를 바로 열 수 있게 합니다.

### 영향

- 신규 사용자가 대시보드 안에서 사용법과 운영 기준을 바로 확인할 수 있습니다.
- 산출물 레지스트리가 파일 경로 목록에서 실제 문서 탐색 화면으로 발전합니다.
- 다음 단계에서 문서 검색과 수정 요청 생성으로 확장할 수 있습니다.

## DEC-011 — Operator UX

### 배경

기능이 늘어나면서 사이드 메뉴가 길어졌고, 개요 화면도 MVP 상태표에 가까워 실제 사용자가 다음에 무엇을 봐야 하는지 판단하기 어려웠습니다.

### 결정

- 사이드 메뉴를 Start, Plan, Control, System 그룹으로 나눕니다.
- 개요 화면은 `Start here`, `Next signal`, `Health` 액션 카드와 P0-P4 운영 지도를 먼저 보여줍니다.
- 상태 숫자는 유지하되, 사용자가 바로 이동할 수 있는 행동 중심 화면으로 재구성합니다.

### 영향

- 새 사용자는 가이드와 현재 상태를 더 빠르게 찾을 수 있습니다.
- 운영자는 증거 누락, 지표, Phase Gate 같은 핵심 신호로 바로 이동할 수 있습니다.
- Process Dashboard가 MVP 상태표에서 운영 커맨드센터에 가까운 형태로 발전합니다.

## DEC-012 — Premium Dashboard UX

### 배경

v0.11에서 메뉴를 그룹화했지만, 메뉴 수가 계속 늘어나면 스크롤 의존도가 커지고 화면의 완성도도 아직 MVP 느낌이 남습니다. 실제 스타트업 운영 도구처럼 쓰려면 검색 가능한 내비게이션과 현재 위치를 설명하는 콘솔형 헤더가 필요합니다.

### 결정

- 사이드바에 메뉴 검색과 quick jump를 추가합니다.
- System처럼 자주 쓰지 않는 그룹은 접을 수 있게 하고, 현재 활성 메뉴가 속한 그룹은 자동으로 펼칩니다.
- 메인 헤더는 현재 섹션 설명, sprint, version, updated date를 보여주는 command header로 고도화합니다.
- Atlassian Side navigation, IBM Carbon UI shell left panel, Material Navigation drawer 같은 메이저 레퍼런스의 운영 콘솔 원칙을 문서에 남깁니다.

### 영향

- 새 사용자는 검색과 quick jump로 메뉴를 더 빠르게 찾을 수 있습니다.
- 운영자는 넓은 본문 영역에서 현재 섹션 맥락과 시스템 버전을 바로 확인할 수 있습니다.
- Goodz Process Dashboard가 기능 목록형 MVP에서 실제 운영 제품에 가까운 정보 구조로 발전합니다.

## DEC-013 — Design OS

### 배경

Process OS가 기획, 승인, 추적, 지표를 다루게 되었지만 디자인 의사결정은 아직 `DESIGN_SYSTEM.md`와 화면 스펙에 흩어져 있습니다. 실제 제품 개발에서는 레퍼런스 선택, 와이어프레임, 스토리보드가 개발 범위와 승인 기준을 크게 줄여줍니다.

### 결정

- `docs/02-design/DESIGN_OS.md`를 디자인 운영 허브로 추가합니다.
- `REFERENCES.md`, `wireframes/README.md`, `storyboards/README.md`를 Design OS 산출물로 등록합니다.
- `status.json`에 `designReferences`, `wireframes`, `storyboards` 배열을 추가합니다.
- Process Dashboard에 `디자인` 메뉴를 추가해 디자인 산출물 상태를 확인합니다.

### 영향

- 디자인 레퍼런스가 링크 모음이 아니라 차용점과 적용 화면까지 남습니다.
- 개발 전 화면 구조와 사용자 흐름을 먼저 합의할 수 있습니다.
- 추후 Figma 연동, 디자인 QA, reference-to-screen 자동 연결로 확장할 기반이 생깁니다.

## DEC-014 — Premium White UI

### 배경

프로세스 대시보드는 기능적으로는 확장됐지만, white + pastel 카드 3색 조합이 generic SaaS 템플릿처럼 보일 수 있습니다. 실제 운영자가 오래 보는 화면은 장식 색보다 정보 위계, 표면 depth, 상태 신호의 명확성이 중요합니다.

### 결정

- 일반 카드 배경은 white/#FAFAFA와 미세 보더 중심으로 통일합니다.
- pastel 배경은 장식으로 쓰지 않고 success/warning/risk 상태 신호에만 제한합니다.
- 개요의 긴 metric row는 Completion, Delivery Health, Operations 그룹으로 압축합니다.
- P0-P4 운영 맵은 독립 카드 나열이 아니라 선형 phase flow로 보여줍니다.
- 사이드바 active state는 near-black fill로 강하게 표시하고 나머지는 light gray/white 계층으로 정리합니다.

### 영향

- 대시보드가 MVP 템플릿 느낌에서 운영 콘솔 제품에 가까워집니다.
- 새 메뉴가 늘어나도 카드 색이 화면을 지배하지 않아 정보 탐색이 쉬워집니다.
- 이후 role-based view, guided workflow, 브라우저 QA 체크리스트를 얹을 수 있는 시각 기반이 정리됩니다.

## DEC-015 — Template Onboarding Baseline

### 배경

Goodz의 문서와 대시보드는 성숙했지만 새 팀이 fork한 뒤 따라갈 단일 런북과 기계 판독 가능한 템플릿 계약이 없었습니다. web-shop은 저장소 밖 로컬 GA harness 경로에 의존해 clean clone 설치도 독립적이지 않았습니다.

### 결정

- 30분 fork 온보딩 런북과 template.config.json을 템플릿 계약으로 둡니다.
- pnpm check:template을 verify와 CI에 포함합니다.
- 저장소 밖 file 의존성을 금지하고 GA harness는 고정 GitHub commit으로 설치합니다.
- v0.15는 기반 완료이며, clean-clone CI와 rebrand 리허설 이후에만 v1.0으로 승격합니다.

### 영향

- 필수 문서나 env example이 빠지면 CI에서 바로 발견됩니다.
- 형제 저장소 없이 clone한 작업공간에서도 의존성 설치가 가능합니다.
- v1.0 완료 조건이 UI 기능 추가가 아니라 재사용성 증거로 명확해집니다.

## DEC-016 — White Premium Detail Tuning

### 배경

동일 크기와 비슷한 표면을 반복하면 정돈된 인상은 생기지만, 사용자가 어디서 시작하고 어떤 신호를 먼저 읽어야 하는지 판단하기 어렵습니다.

### 결정

- CTA와 metric은 역할에 따라 배경, 그림자, 타이포 크기를 다르게 사용합니다.
- 숫자 0보다 대기열 없음, 모두 완료 같은 운영 의미를 먼저 보여줍니다.
- 상태 색은 의미가 있는 signal에만 쓰고 inactive navigation은 읽을 수 있는 대비를 유지합니다.
- 모든 컨테이너를 움직이지 않고 클릭 가능한 핵심 카드에만 hover lift를 적용합니다.

### 영향

- Start here와 현재 운영 단계가 첫 시선에 들어옵니다.
- 동일 데이터라도 불안 신호보다 완료 상태와 다음 행동을 중심으로 읽힙니다.
- 화이트 테마가 단조로운 카드 그리드보다 운영 제품에 가까운 계층을 갖습니다.

## DEC-017 — Sidebar Comfort

### 배경

모든 그룹이 펼쳐진 사이드바는 메뉴를 빠르게 훑기 어렵고, 중첩 카드가 실제 정보보다 많은 여백과 테두리를 사용했습니다.

### 결정

- 활성 그룹만 자동으로 열고 비활성 그룹은 기본 접힘으로 시작합니다.
- 메뉴 그룹은 카드보다 divider로 구분합니다.
- navigation만 스크롤하고 헤더와 SSOT footer는 고정합니다.
- sidebar 전용 scrollbar gutter와 track/thumb를 사용합니다.

### 영향

- 첫 화면에서 Start 그룹과 핵심 메뉴가 여유 있게 보입니다.
- 그룹 전환 시 활성 그룹이 자동으로 열려 메뉴를 다시 찾을 필요가 없습니다.
- 스크롤바와 마지막 항목이 콘텐츠 경계에 붙지 않습니다.

## DEC-018 — SQLite Operations Store

### 배경

Phase·승인·산출물은 Git 기반 문서가 추적에 유리하지만, incident 생성·종료와 MTTR까지 매번 문서 커밋으로 처리하면 운영 흐름이 느려집니다.

### 결정

- 문서와 `status.json`을 Process OS의 SSOT로 유지합니다.
- 문서 검색 인덱스와 운영 incident만 SQLite에 저장합니다.
- Process Dashboard와 API는 같은 Node 서비스로 배포합니다.
- 운영 배포는 영구 디스크가 있는 단일 인스턴스를 사용합니다.

### 영향

- 문서 추적성과 운영 쓰기 편의성을 함께 유지합니다.
- 무료 임시 파일시스템에서는 incident 보존을 보장하지 않습니다.
- 수평 확장이 필요해지면 서버형 DB 전환 ADR이 필요합니다.

## DEC-019 — Process Dashboard Redesign Color Responsibility

### 배경

초안 PRD는 보라·상태색 배경을 전부 제거하라는 원칙과 START 카드에 violet tint를 쓰라는 상세 지시가 충돌했습니다.

### 결정

- 일반 surface와 강조 카드는 white/zinc로 통일합니다.
- violet은 active indicator와 current phase ring에만 사용합니다.
- success, warning, danger의 옅은 배경은 작은 상태 badge에만 허용합니다.
- Queue는 큰 숫자 카드가 아니라 Hero의 자연어 신호로 제공합니다.

### 영향

- 화이트 테마의 색 온도가 일관되고 CTA 위계는 indicator와 shadow로 유지됩니다.
- 상태 의미를 잃지 않으면서 장식용 pastel 반복을 제거합니다.
- PRD의 상위 디자인 원칙과 화면별 구현 지시가 같은 기준을 사용합니다.

## DEC-020 — Writable Process Command Model

### 배경

문서와 `status.json` projection만으로는 사용자가 Dashboard에서 프로젝트를 시작하거나 Task와 Gate를 관리할 수 없습니다. 반대로 모든 Markdown을 DB로 옮기면 Git 기반 추적성과 기존 산출물 계약을 잃습니다.

### 결정

- 장문 문서, 승인·산출물과 외부 증거는 기존 Git SSOT를 유지합니다.
- 프로젝트 실행의 Project, Run, Stage, Task, Gate와 audit event는 SQLite를 기준 저장소로 사용합니다.
- Dashboard는 Process API에 command를 보내고 상태 전이 검증은 서버가 수행합니다.
- GO는 모든 Task 완료를 요구하며 다음 Stage를 자동 시작합니다.
- 새로운 산업별 프로세스는 Core 분기가 아니라 Template version으로 추가합니다.

### 영향

- Process Dashboard가 관찰 화면에서 실제 Process Control Plane으로 확장됩니다.
- 로컬 Core는 단일 SQLite 인스턴스를 유지하고 Cloud는 PostgreSQL/Worker로 같은 계약을 확장할 수 있습니다.
- Template Builder, Deliverable/Evidence command와 RBAC가 다음 제품 단계가 됩니다.
