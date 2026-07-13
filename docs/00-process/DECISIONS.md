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
