# 후속 제품 코드 이식 매니페스트

> 원칙: 폴더 전체를 복사하지 않는다. 새 제품의 계약과 테스트를 먼저 만든 뒤, 아래 승인 단위에서 필요한 코드만 이식한다.
>
> 대상: [dayainow/beacon-project-os](https://github.com/dayainow/beacon-project-os)

## 이식 후보

| 원본 | 결정 | 후속 책임 | 이식 조건 |
|------|------|-----------|-----------|
| `packages/process/src/index.ts` | 부분 이식 | Project Identity, Run, Stage, Gate, Audit 계약 | Design Job·Commerce·정적 대시보드 projection 타입 제외 |
| `packages/cli/src/config.ts` | 부분 이식 | `init`, `adopt`, `verify` | 단일 폴더=단일 프로젝트 계약과 새 config schema를 먼저 확정 |
| `packages/cli/src/config.test.ts` | 패턴 이식 | 외부 저장소 초기화·보호 테스트 | temp repository 기반 테스트 유지 |
| `apps/api-server/src/data/operationsStore.ts` | 부분 이식 | 로컬 SQLite와 migration | Commerce route와 Goodz 내부 Reference seed 제거 |
| `templates/process/*.json` | 축소 이식 | 기본 P0–P4 Template | 하나의 최소 Template부터 시작, Builder 기능 제외 |
| `apps/api-server/src/scripts/validateWorkspaceBoundary.ts` | 테스트 이식 | 샘플 없는 빈 Workspace 계약 | 새 runtime HTTP smoke로 재작성 |
| `scripts/validate-clean-clone.mjs` | 패턴 이식 | 독립 설치 검증 | Goodz monorepo 전체 복사가 아닌 배포 패키지 fixture 검증 |
| `apps/process-dashboard/src/components/MarkdownDocument.tsx` | 검토 후 이식 | 산출물 렌더링 | 새 Dashboard UI 토큰과 접근성 검증 후 사용 |
| `packages/ui`의 기본 토큰 | 선택 이식 | 최소 디자인 토큰 | Commerce 전용 표현과 컴포넌트 제외 |

## 이식하지 않음

| 원본 | 이유 |
|------|------|
| `apps/web-shop` | Commerce Reference이며 후속 제품 핵심이 아님 |
| `apps/admin-dashboard` | Commerce Reference 운영 UI |
| `packages/types` | Commerce 도메인 타입 |
| `references/internal-service` | 이식성 증거이며 runtime 기능이 아님 |
| `references/goodz-internal` | Goodz 자체 개발 기록 |
| `apps/process-dashboard/src/App.tsx` 전체 | 4,000줄 이상에 Reference·운영·프로젝트 기능이 결합됨 |
| Template Builder UI와 API | 단일 기본 Template MVP 범위 밖 |
| PRD·Design Workbench 전체 | 자동 프로젝트 관찰보다 앞서지 않음 |
| `packages/cli/src/git.ts` | 자동 branch·push·PR은 MVP 비목표 |
| `packages/cli/src/materializer.ts` 전체 | Project Book 요구가 확정된 뒤 새 export 계약으로 재설계 |
| DORA·Incident·Metric snapshot 코드 | 기본 Project Health보다 후순위 |
| Goodz Sprint S0–S34 운영 데이터 | 새 제품의 샘플이나 초기 데이터로 사용하지 않음 |

## Beacon 새 저장소 최소 구조

```text
apps/dashboard
packages/core
packages/runtime
packages/cli
templates/default
fixtures/sample-project
docs/PRODUCT.md
docs/ARCHITECTURE.md
```

## 이식 순서

1. [x] 제품명 Beacon, 한 줄 정의와 비목표를 확정한다.
2. `beacon init → beacon open → identity` 인수 테스트를 먼저 작성한다.
3. Project Identity와 config schema를 작성한다.
4. CLI 초기화 코드의 필요한 부분만 이식한다.
5. 로컬 runtime과 빈 Dashboard를 연결한다.
6. 파일·Git 스캐너를 새 코드로 작성한다.
7. Process Run·Gate 계약을 필요한 범위로 이식한다.
8. 산출물, Health, Timeline을 세로 흐름으로 추가한다.

## 출처 기록

후속 저장소 첫 ADR은 원본 저장소 URL, 기준 tag/commit, 이식 파일과 변경 이유를 기록한다. 새 저장소는 Goodz Git history 전체를 가져오지 않고 독립적인 초기 commit부터 시작한다.
