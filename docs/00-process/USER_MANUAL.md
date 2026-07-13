# Goodz Process Dashboard 이용 매뉴얼

Goodz Process Dashboard는 쇼핑몰 데모를 관리하는 도구가 아니라, **기획 → 디자인 → 개발 → QA → 배포** 과정을 한 곳에서 확인하는 운영 화면입니다.

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
2. **가이드**에서 이 매뉴얼과 운영 문서를 읽습니다.
3. **기획**과 **변경**에서 요청과 수정 내역을 확인합니다.
4. **산출물**에서 PRD, API, QA, 릴리스 문서를 바로 열어봅니다.
5. **승인**에서 DACI 역할과 승인 기준을 확인합니다.
6. **증거**에서 Issue, PR, commit, CI, release, smoke 누락을 확인합니다.
7. **지표**에서 Delivery Metrics와 snapshot trend를 확인합니다.
8. **추적**에서 기획부터 CI 증거까지 연결됐는지 확인합니다.

## 사이드 메뉴 구조

메뉴는 실제 운영 흐름에 맞춰 네 그룹으로 나뉩니다.

| 그룹 | 메뉴 | 용도 |
|------|------|------|
| Start | 개요, 가이드 | 처음 들어왔을 때 상태와 사용법 확인 |
| Plan | 기획, 변경, 산출물 | 요청과 문서 원문 확인 |
| Control | 승인, 증거, 지표, 추적 | 운영 통제와 품질 신호 확인 |
| System | Phase Gate, 작업 큐, 기능, 앱 | 실행 상태와 로컬 서비스 확인 |

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

문서 원본은 Git에 남아 있는 Markdown 파일입니다. 대시보드는 API를 통해 읽기 전용으로 보여줍니다.

## 운영 명령

| 명령 | 용도 |
|------|------|
| `pnpm check:process` | status, 산출물, trace, snapshot 정합성 검증 |
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

- 문서 Markdown 렌더링 품질 개선
- 문서 검색
- 문서 수정 요청 생성 버튼
- incident/MTTR 운영 가이드 추가
