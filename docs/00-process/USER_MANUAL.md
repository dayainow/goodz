# Goodz Process Dashboard 이용 매뉴얼

Goodz Process Dashboard는 쇼핑몰 데모를 관리하는 도구가 아니라, **기획 → 디자인 → 개발 → QA → 배포** 과정을 한 곳에서 확인하는 운영 화면입니다.

Dashboard는 원본 문서 편집기나 Jira/GitHub의 대체물이 아닙니다. Git 문서와 외부 증거를 보여주는 **운영 projection**이면서, 프로젝트·단계·작업·Gate를 변경하는 **Process Control Plane command UI**입니다.

## 프로젝트 프로세스 관리

1. **프로젝트**에서 이름, 목표, Owner와 Template을 선택해 Process Run을 만듭니다.
2. 현재 Stage의 Task 상태와 담당자를 저장합니다.
3. 모든 Task를 완료한 뒤 결정 근거를 입력합니다.
4. **GO**는 다음 Stage를 자동 시작하고, **HOLD**는 차단하며, **KILL**은 Run을 종료합니다.
5. 최근 실행 이력에서 프로젝트 생성, 작업 변경과 Gate 결정을 확인합니다.

GO는 현재 Stage의 모든 Task가 `done`이어야 합니다. HOLD와 KILL은 반드시 근거를 입력합니다. 실행 상태와 감사 이력은 SQLite에 저장되고, 장문 산출물과 외부 증거는 Git/GitHub 원본을 유지합니다.

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

1. **개요**에서 현재 스프린트, 오늘 볼 신호, 권장 액션을 확인합니다.
2. **프로젝트**에서 Process Run을 만들거나 현재 Stage를 운영합니다.
3. **가이드**에서 이 매뉴얼과 운영 문서를 읽습니다.
4. **기획**과 **변경**에서 요청과 수정 내역을 확인합니다.
5. **디자인**에서 레퍼런스, 와이어프레임, 스토리보드를 확인합니다.
6. **산출물**에서 PRD, API, QA, 릴리스 문서를 바로 열어봅니다.
7. **승인**에서 DACI 역할과 승인 기준을 확인합니다.
8. **증거**에서 Issue, PR, commit, CI, release, smoke 누락을 확인합니다.
9. **지표**와 **추적**에서 흐름과 Delivery health를 확인합니다.

## 매일 운영하는 순서

1. **개요**의 Next signal과 우선 처리 작업을 확인합니다.
2. 작업 후 intake, change, deliverable과 approval 원본을 갱신합니다.
3. `pnpm sync:github-trace`로 Commit/CI 증거를 보강합니다.
4. **증거**에서 누락된 Issue, PR, CI, Release, Smoke를 확인합니다.
5. **지표**와 **추적**에서 흐름이 연결됐는지 확인합니다.
6. `pnpm verify` 통과 후 해당 Phase Gate를 판정합니다.

## 사이드 메뉴 구조

메뉴는 실제 운영 흐름에 맞춰 네 그룹으로 나뉩니다.

| 그룹 | 메뉴 | 용도 |
|------|------|------|
| Start | 개요, 프로젝트, 가이드 | 상태 확인, Process Run 시작과 사용법 확인 |
| Plan | 기획, 변경, 디자인, 산출물 | 요청, 설계, 문서 원문 확인 |
| Control | 승인, 증거, 지표, 추적 | 운영 통제와 품질 신호 확인 |
| System | Phase Gate, 작업 큐, 기능, 앱 | 실행 상태와 로컬 서비스 확인 |

### 메뉴를 빠르게 찾는 법

- 상단 **메뉴 검색**에 `증거`, `Metrics`, `앱`처럼 메뉴명이나 설명 키워드를 입력합니다.
- **Quick jump**는 매일 가장 자주 쓰는 개요, 프로젝트, 가이드, 지표로 바로 이동합니다.
- 잘 쓰지 않는 그룹은 접어두고, 현재 보고 있는 메뉴가 포함된 그룹은 자동으로 펼쳐진 상태를 유지합니다.

## 디자인 메뉴 읽는 법

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
