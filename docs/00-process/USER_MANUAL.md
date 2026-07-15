# Goodz Process Dashboard 이용 매뉴얼

Goodz Process Dashboard는 새로운 제품·서비스 아이디어를 프로젝트로 시작하고, **기획 → 디자인 → 개발 → QA → 배포** 전 과정을 단계별로 실행·관리하는 풀프로세스 운영 화면입니다.

## 10분 안에 쓰기 (메인 경로)

1. `pnpm dev` 후 http://localhost:5180 접속 (기본 화면 = **Workspace → 프로젝트**)
2. **프로젝트명 · 목표 · Owner · 템플릿**만 입력하고 **프로젝트 시작**
3. 열린 Stage에서 Task 상태를 `done`으로 저장
4. 필수 산출물에 URI·Owner를 넣고 **승인**
5. 조건이 채워지면 **GO** (다음 Stage 자동 시작). 막히면 **HOLD**, 종료면 **KILL**
6. GO/시작 후 `docs/projects/<project-id>/`에 Markdown이 생기는지 확인
7. 완료(또는 진행 중)면 **Project Book 다운로드**로 여정 기록 받기

이게 Goodz의 목적에 맞는 기본 사용법입니다. PRD Wizard·Design Workbench·템플릿 편집·Goodz Reference 메뉴는 **선택/고급**입니다.

아이디어를 PRD로 구체화하고, 디자인 작업을 전달하며, Stage·Task·산출물·Phase Gate를 운영하고, GitHub·CI·배포 증거까지 같은 프로젝트 흐름에서 추적할 수 있습니다. Dashboard는 Git 문서와 외부 증거를 연결하는 **운영 projection**이자 실제 프로세스를 변경하는 **Process Control Plane command UI**입니다.

## 데이터 범위 구분

Dashboard는 사용자 프로젝트와 Goodz 자체 개발 기록을 명확히 분리합니다.

| 범위 | 저장소 | 사용 대상 |
|------|--------|----------|
| **Workspace** | Operations DB(SQLite/PostgreSQL) | 사용자가 생성한 프로젝트·PRD·Design Pack·Run·Task·Gate |
| **Library** | Git 문서 | 모든 프로젝트가 함께 쓰는 이용 매뉴얼과 운영 기준 |
| **Goodz Reference** | `references/goodz-internal/` | Goodz 자체의 IN·CR·DR·TL·Sprint·지표·Phase 개발 기록. 내부 설정이 있을 때만 표시 |

로그인 후 기본 화면은 **Workspace → 프로젝트**입니다. 신규 `goodz init` Workspace에는 프로젝트와 Goodz Reference가 없으며 사용자가 첫 프로젝트부터 기록을 쌓습니다. Goodz 소스 저장소에서만 표시되는 기존 기획·변경·디자인·증거는 Goodz 제품을 업그레이드하는 내부 범위입니다.

## 프로젝트 프로세스 관리

1. **프로젝트**에서 기존 Template을 선택하거나 **새 템플릿 만들기**로 팀 프로세스를 구성합니다.
2. Visual Builder에서 Stage·Task·산출물을 추가하고 순서와 필수 여부를 정한 뒤 Catalog에 저장합니다. 기존 Template은 **복제 편집**으로 시작할 수 있습니다.
3. 이름, 목표, Owner와 Template을 선택해 Process Run을 만듭니다.
4. 현재 Stage의 Task 상태와 담당자를 저장합니다.
5. 필수 산출물에 Owner와 URI를 입력하고 승인 상태로 변경하며, 필요하면 CI·PR·문서 증거를 연결합니다.
6. 모든 Task와 필수 산출물 조건을 충족한 뒤 결정 근거를 입력합니다.
7. **GO**는 다음 Stage를 자동 시작하고, **HOLD**는 차단하며, **KILL**은 Run을 종료합니다.
8. 최근 실행 이력에서 Template·프로젝트·작업·산출물·증거와 Gate 결정을 확인합니다.

GO는 현재 Stage의 모든 Task가 `done`이고 필수 산출물이 `approved`여야 합니다. HOLD와 KILL은 반드시 근거를 입력합니다. 실행 상태와 감사 이력은 SQLite에 저장되고, 장문 산출물과 외부 증거는 Git/GitHub 원본을 유지합니다.

## PRD와 디자인 준비

프로젝트를 선택하면 상단 Project Workbench에서 다음 흐름을 진행합니다.

1. **PRD Wizard**에서 문제, 타깃 사용자, 핵심 가치, MVP 범위, 비목표, 성공 지표와 제약을 입력합니다.
2. 오른쪽 `Generated PRD.md`를 검토하고 초안을 저장한 뒤 승인합니다.
3. **Design Workbench**에서 디자인 방향·무드·팔레트·타이포그래피를 정합니다.
4. 화면별 목적·영역·주요 행동을 입력해 MVP 와이어프레임 명세를 만듭니다.
5. Actor·Action·Screen·Outcome으로 스토리보드를 작성합니다.
6. Design Pack을 저장하고 `Handoff 작업 생성`을 눌러 prompt snapshot을 고정합니다.
7. `작업 시작` 후 prompt를 Claude Design에 전달해 high-fidelity UI를 제작합니다.
8. 완성된 `https://claude.ai/...` URL과 검토 메모를 제출합니다.
9. 결과가 부족하면 `수정 요청`, 충분하면 `Design 승인`을 선택합니다.
10. 승인 후 `산출물 번들 다운로드`로 PRD·Design Pack·handoff Markdown을 내보냅니다.
11. 저장소에서는 `pnpm goodz -- export --project <Project ID> --root .`로 같은 bundle을 실제 Markdown과 hash manifest로 생성합니다.

PRD나 Design Pack을 승인한 뒤 내용을 수정하면 다시 Draft가 되고, 열려 있는 Design Job은 수정 필요 상태가 됩니다. Goodz는 high-fidelity UI를 직접 그리는 대신 Claude Design이 작업할 입력 패키지, prompt snapshot, 결과 검증 상태를 관리합니다.

CLI export는 기존 파일이 마지막 export 이후 수정되었으면 중단합니다. 먼저 `--dry-run`으로 확인하고, 사용자 변경을 의도적으로 폐기할 때만 `--force`를 사용합니다. 자세한 명령은 [CLI.md](./CLI.md)를 참고합니다.

## 접속

```bash
pnpm dev
```

주요 주소:

| 서비스 | 주소 | 용도 |
|--------|------|------|
| Process Dashboard | `http://localhost:5180` | 풀 프로세스 운영 |
| API Server | `http://localhost:4000` | 데이터 API |
| Web Shop | `http://localhost:3000` | 쇼핑몰 레퍼런스 |
| Admin | `http://localhost:5173` | 운영 UI 레퍼런스 |

포트가 이미 사용 중이면 Vite가 다음 포트로 자동 실행될 수 있습니다.

## 기본 사용 순서

1. **Workspace → 프로젝트**에서 Process Run을 만들거나 현재 Stage를 운영합니다.
2. 프로젝트 안의 PRD Wizard, Design Workbench, Task, 산출물, Evidence와 Gate를 사용합니다.
3. 공통 사용법이 필요하면 **Library → 가이드**를 엽니다.
4. Goodz 소스 저장소에서 자체 개발 현황을 확인할 때만 선택적으로 표시되는 **Goodz Reference**를 펼칩니다.

## Goodz 자체를 개발할 때

다음 절차는 일반 프로젝트 사용자가 아니라 Goodz Core 관리자·개발자를 위한 Reference 운영 절차입니다.

1. **Goodz Reference → 시스템 개요**의 Next signal과 우선 처리 작업을 확인합니다.
2. 작업 후 intake, change, deliverable과 approval 원본을 갱신합니다.
3. `pnpm sync:github-trace`로 Commit/CI 증거를 보강합니다.
4. **증거**에서 누락된 Issue, PR, CI, Release, Smoke를 확인합니다.
5. **지표**와 **추적**에서 흐름이 연결됐는지 확인합니다.
6. `pnpm verify` 통과 후 해당 Phase Gate를 판정합니다.

## 사이드 메뉴 구조

메뉴는 데이터 소유권과 사용 대상을 기준으로 세 그룹으로 나뉩니다.

| 그룹 | 메뉴 | 용도 |
|------|------|------|
| Workspace | 프로젝트 | 사용자 프로젝트 생성과 Process Run 실행 |
| Library | 가이드 | 모든 프로젝트가 함께 쓰는 매뉴얼과 운영 기준 |
| Goodz Reference | 시스템 개요, 기획, 변경, 디자인, 산출물, 승인, 증거, 지표, 추적, Phase Gate, 작업 큐, 기능, 운영 DB, 앱 | Goodz 자체 개발 기록과 관리자 진단 |

### 메뉴를 빠르게 찾는 법

- 상단 **메뉴 검색**에 `증거`, `Metrics`, `앱`처럼 메뉴명이나 설명 키워드를 입력합니다.
- **Quick jump**는 사용자 작업 공간인 프로젝트와 공용 가이드로 바로 이동합니다.
- 잘 쓰지 않는 그룹은 접어두고, 현재 보고 있는 메뉴가 포함된 그룹은 자동으로 펼쳐진 상태를 유지합니다.

## 디자인 메뉴 읽는 법

이 메뉴는 **Goodz Reference**에 속하며 개별 사용자 프로젝트의 Design Pack과 다릅니다. 프로젝트별 화면·스토리보드·Claude Design Job은 **Workspace → 프로젝트 → Design Workbench**에서 관리합니다.

- **Reference Board**: Atlassian, Carbon, Polaris, GOV.UK 같은 레퍼런스와 Goodz 적용 화면을 확인합니다.
- **Wireframes**: 새 화면을 만들기 전 정보 구조와 우선순위를 확인합니다.
- **Storyboards**: 사용자가 어떤 순서로 화면을 이동하고 결정을 내리는지 확인합니다.
- 문서 원본은 `docs/02-design/` 아래 Markdown 파일입니다.

## 개요 화면 읽는 법

- **Start here**: 처음 보는 사용자가 바로 눌러야 할 가이드
- **Next signal**: 증거 누락이나 운영 리스크가 있을 때 먼저 확인할 영역
- **Health**: Delivery Metrics와 snapshot trend로 보는 운영 건강도
- **Operating map**: P0부터 P4까지 Gate 진행 상태
- **우선 처리 작업**: 아직 완료되지 않은 작업 큐

## 문서 보기

대시보드 안에서 `docs/**/*.md` 문서를 바로 확인할 수 있습니다.

- **가이드** 메뉴: 서비스 이용 매뉴얼, 에이전트 가이드, 워크플로우, Metrics, CI/CD 문서
- **산출물** 메뉴: PRD, 유저스토리, API, QA, 릴리스 체크리스트 같은 deliverable 원문

데스크톱에서는 산출물 목록 오른쪽의 문서 패널이 스크롤 중에도 유지됩니다. 작은 화면에서는 `문서 보기`를 누르면 문서 패널로 자동 이동하며, 현재 선택 항목은 `열린 문서`로 표시됩니다.

문서 원본은 Git에 남아 있는 Markdown 파일입니다. 대시보드는 API를 통해 읽기 전용으로 가져와 제목, 표, 목록, 링크, 코드가 적용된 GFM 문서로 보여줍니다.

## 운영 명령

| 명령 | 용도 |
|------|------|
| `pnpm check:process` | status, 산출물, trace, snapshot 정합성 검증 |
| `pnpm check:portability` | Core 계약과 비커머스 Reference 독립성 검증 |
| `pnpm sync:github-trace` | commit 기준 GitHub CI/PR/Issue/Release 증거 보강 |
| `pnpm snapshot:metrics` | 현재 Delivery Metrics 기준점 저장 |
| `pnpm verify` | 워크스페이스, 의존성, 프로세스, 빌드, 린트 전체 검증 |

## 새 작업을 진행할 때

1. 요청을 `intakes` 또는 `planningChanges`에 남깁니다.
2. 산출물이 생기면 `deliverables`에 등록합니다.
3. 승인 기준이 필요하면 `approvals`에 DACI 레코드를 만듭니다.
4. 코드 변경 후 `traceLinks`에 commit과 CI run을 연결합니다.
5. `pnpm sync:github-trace`로 GitHub timestamp를 보강합니다.
6. 필요하면 `pnpm snapshot:metrics`로 지표 기준점을 저장합니다.

## 완료 기준

- 관련 문서가 대시보드에서 확인됩니다.
- `traceLinks`가 기획, 변경, 산출물, 승인, commit, CI를 연결합니다.
- `pnpm verify`가 통과합니다.
- GitHub Actions CI가 성공합니다.

## 다음 확장

- 문서 검색
- 문서 수정 요청 생성 버튼
- incident/MTTR 운영 가이드 추가
