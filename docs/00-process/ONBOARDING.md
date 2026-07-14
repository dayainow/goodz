# Goodz Core Onboarding

Goodz Core를 새 제품 팀에 도입할 때 사용하는 시작 런북입니다. 목표는 **30분 안에 조직·프로젝트 설정을 입력하고, Process Dashboard를 기동하고, 첫 P0 입력을 등록하는 것**입니다. Goodz는 제품명이며 Commerce 앱은 교체 가능한 Reference다.

현재 v0.21은 `goodz init/adopt/verify` CLI 구현 전 단계다. 따라서 신규 프로젝트는 저장소를 복제한 뒤 아래 설정 파일과 문서를 직접 변경한다.

## 준비 조건

- Node.js 22.13 이상
- Corepack으로 활성화한 pnpm 9.15.9
- GitHub 저장소 쓰기 권한
- 기본 web-shop 분석 연동을 설치할 수 있는 GitHub 네트워크

## 1. Fork와 최초 검증

```bash
git clone <your-repository-url>
cd <your-repository>
corepack enable
pnpm install --frozen-lockfile
pnpm verify
```

`pnpm verify`에는 workspace, dependency, Process OS, template, portability, SQLite, build, lint 검사가 포함됩니다. 실패한 검사를 해결하기 전에는 프로젝트 이름 변경이나 기능 개발을 시작하지 않습니다.

## 2. 조직·프로젝트 설정

Goodz 브랜드와 `@goodz/process` 계약은 유지하고 도입 조직의 정보와 Reference를 설정합니다.

| 순서 | 대상 | 바꿀 내용 |
|------|------|-----------|
| 1 | `goodz.config.json` | edition, 플랫폼 경계, 사용하는 Reference |
| 2 | `docs/00-process/NORTH_STAR.md` | 도입 조직의 목표와 만드는 것/만들지 않는 것 |
| 3 | `docs/01-planning/PRD.md` | 사용자, 문제, 범위, 성공 기준 |
| 4 | `PROJECT.md` | 조직 프로젝트명, 저장소 링크, 현재 Sprint |
| 5 | Reference 앱 | Commerce Reference 유지·제거 또는 별도 도메인 Reference 추가 |

새 Reference는 자체 타입 패키지와 앱을 추가하되 `@goodz/process`를 수정하지 않습니다. `pnpm check:template`은 플랫폼/Reference 경계를, `pnpm check:portability`는 Core 계약과 Reference 독립성을 검증합니다.

## 3. 런타임 설정

```bash
cp apps/web-shop/.env.local.example apps/web-shop/.env.local
cp apps/admin-dashboard/.env.example apps/admin-dashboard/.env
cp apps/process-dashboard/.env.example apps/process-dashboard/.env
pnpm dev
```

| 앱 | 기본 URL | 역할 |
|----|----------|------|
| web-shop | `http://localhost:3000` | Goodz Commerce Reference B2C UX |
| api-server | `http://localhost:4000` | process/commerce 모듈형 API 런타임 |
| admin-dashboard | `http://localhost:5173` | Goodz Commerce Reference 운영 UX |
| process-dashboard | `http://localhost:5180` | Goodz Core 운영 UI |

포트를 바꾸면 env example, `docs/04-qa/STAGING_RUNBOOK.md`, `docs/00-process/status.json`의 `apps`를 함께 갱신합니다.

## 4. 첫 P0 사이클

1. `docs/01-planning/intake/`에 첫 요청을 작성합니다.
2. PRD, USER_STORIES, GA4_EVENTS를 새 제품 기준으로 고칩니다.
3. `docs/00-process/status.json`에 intake, deliverable, approval, trace link를 연결합니다.
4. `docs/00-process/PHASE_GATES.md`의 P0 기준을 확인합니다.
5. `pnpm check:process && pnpm check:template`을 실행합니다.

P0 Gate가 통과되기 전에는 P1/P2 산출물을 완료로 표시하지 않습니다.

## 5. Dashboard로 첫 사이클 확인

1. `http://localhost:5180`의 **개요**에서 Sprint와 P0 상태를 확인합니다.
2. **프로젝트**에서 이름, 목표, Owner와 기본 P0–P4 Template을 선택합니다.
3. 현재 Stage의 Task 담당자와 상태를 저장합니다.
4. 모든 Task를 완료하고 Gate 근거와 함께 GO를 선택해 다음 Stage가 시작되는지 확인합니다.
5. **기획**과 **산출물**에서 intake와 PRD 원문을 확인합니다.
6. **증거**와 **추적**에서 아직 연결되지 않은 Commit/CI 항목을 확인합니다.

Dashboard는 Git 문서와 `status.json`을 보여주는 projection이자 SQLite Process Run을 변경하는 command UI다. 장문 문서와 외부 증거는 원본 시스템에서, 프로젝트 실행 상태는 Dashboard에서 변경한다.

## 6. 외부 연동

`ga-analytics-harness`는 기본 web-shop에 포함된 GA4 레퍼런스 연동이며 GitHub commit에 고정됩니다. 저장소 밖의 형제 폴더를 요구하지 않으므로 clean clone에서도 설치할 수 있습니다. 이 연동이 필요 없는 제품은 web-shop의 분석 코드와 dependency를 함께 제거합니다. 네트워크가 제한된 환경에서는 조직 내부 registry mirror로 바꾼 뒤 lockfile을 갱신합니다.

GitHub trace sync는 저장소를 바꾼 후 다음 환경 변수를 사용합니다.

```bash
GOODZ_GITHUB_REPO=<owner>/<repository> pnpm sync:github-trace
```

## 온보딩 완료 기준

- [ ] `pnpm install --frozen-lockfile` 성공
- [ ] `pnpm verify` 성공
- [ ] 4앱 로컬 기동과 기본 URL 확인
- [ ] North Star와 PRD가 새 제품 기준으로 변경됨
- [ ] 첫 intake와 DACI 승인 요청이 `status.json`에 연결됨
- [ ] GitHub CI가 새 저장소에서 green

제품/Reference 경계는 `goodz.config.json`, 템플릿 필수 경로는 `template.config.json`, 검증 구현은 `scripts/validate-template.mjs`가 SSOT입니다.
