# 프로세스 모니터링 대시보드

> **Goodz 시스템 제품**의 진행도 SSOT를 시각화하는 4번째 앱

## 왜 필요한가

Goodz의 진짜 제품은 쇼핑몰이 아니라 **P0–P4 풀 프로세스 시스템**입니다.  
Phase Gate·Sprint·기획 입력·산출물·기능 백로그·개발 증거를 **한 화면에서 관리**해야 에이전트·PM이 상태를 공유할 수 있습니다.

## 아키텍처

```text
docs/00-process/status.json              ← SSOT (수동·에이전트 갱신)
docs/00-process/metrics-snapshots.json   ← Metrics trend snapshot
        │
        ▼ GET /api/process/status
        ▼ GET /api/process/metrics-snapshots
        ▼ GET /api/process/document?path=...
api-server (:4000)
        │
        ▼ fetch
process-dashboard (:5180)       ← 모니터링 UI
```

| 레이어 | 역할 |
|--------|------|
| `status.json` | Phase·Sprint·기획 입력·기획 변경·산출물·DACI 승인·추적 링크·기능·앱 목록의 기계 판독 가능 상태 |
| `metrics-snapshots.json` | Delivery Metrics 추세를 위한 저장 시점별 기준점 |
| `@goodz/types` | `ProcessStatus` 타입 SSOT |
| `api-server` | JSON 파일 로드·API 제공 |
| `process-dashboard` | 30초 폴링 · 검색/접힘 사이드바 · 프리미엄 화이트 Overview · 콘솔형 헤더 · Guide/Intake/Change/Deliverable/DACI Approval/Evidence/Metrics/Trace/Phase/Queue/Feature/App 관리 뷰 |

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

- **개요** — Sprint 목표·오늘 볼 신호·권장 액션·P0-P4 운영 지도·우선 처리 작업
- **기획** — 입력 요청·출처·다음 액션
- **변경** — 기획 수정 요청·대상 문서·반영 상태
- **디자인** — 디자인 시스템, 레퍼런스, 와이어프레임, 스토리보드
- **가이드** — 서비스 이용 매뉴얼, 에이전트 가이드, 워크플로우, Metrics, CI/CD 문서 원문
- **산출물** — PRD·화면설계·API·QA·릴리스 문서 레지스트리
- **승인** — Driver·Approver·Contributors·Informed·승인 기준·결정 로그
- **증거** — Issue/PR/Commit/CI/승인/릴리즈·스모크 누락 경고
- **지표** — DORA 원형 지표, Goodz delivery health, snapshot trend, 요청→커밋→CI→증거 시간
- **추적** — 기획·변경·산출물·승인과 Issue/PR/Commit/CI/Release 증거 연결
- **Phase Gate** — P0–P4 패널 + 문서 경로
- **작업 큐** — 차단/진행/대기/완료 상태별 항목
- **기능** — F-01… 기능 백로그 테이블
- **앱** — 4앱 포트·역할·바로가기

## 사이드바 정보 구조

메뉴가 많아졌기 때문에 v0.11부터 기능 목록을 단순 나열하지 않고 업무 흐름별로 묶습니다.
v0.12부터는 검색, quick jump, 접힘 그룹을 추가해 자주 쓰는 메뉴와 깊은 운영 메뉴를 분리합니다.

| 그룹 | 메뉴 | 의도 |
|------|------|------|
| Start | 개요, 가이드 | 새 사용자와 운영자가 처음 볼 화면 |
| Plan | 기획, 변경, 디자인, 산출물 | 요청, 설계, 문서 SSOT 확인 |
| Control | 승인, 증거, 지표, 추적 | 운영 통제와 품질 신호 확인 |
| System | Phase Gate, 작업 큐, 기능, 앱 | 실행 상태와 서비스 링크 확인 |

### v0.12 Sidebar UX

- **메뉴 검색**: `label`, `eyebrow`, 설명 문구를 기준으로 메뉴를 필터링합니다.
- **Quick jump**: 개요, 디자인, 가이드, 지표처럼 자주 쓰는 메뉴를 상단에 고정합니다.
- **접힘 그룹**: System처럼 빈번하지 않은 그룹은 접어두고, 활성 메뉴가 있는 그룹은 자동으로 펼칩니다.
- **운영 수치 고정**: Trace, Evidence, Sprint 신호는 메뉴 스크롤과 무관하게 상단에서 확인합니다.

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
