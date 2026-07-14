# Goodz Core Onboarding

Goodz Core를 새 제품 팀에 도입할 때 사용하는 시작 런북입니다. 목표는 **30분 안에 조직·프로젝트 설정을 입력하고, Process Dashboard를 기동하고, 첫 P0 입력을 등록하는 것**입니다. Goodz는 제품명이며 Commerce 앱은 교체 가능한 Reference다.

v1.1은 `goodz init`, `goodz adopt`, `goodz project create`, `goodz export`, `goodz verify`를 제공한다. 신규 설치는 Goodz 자체 개발 이력을 포함하지 않는 빈 Workspace를 만들고, 기존 코드베이스에는 CLI가 구조를 분석한 뒤 운영 메타데이터를 명시적으로 적용한다.

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

`pnpm verify`에는 workspace, dependency, Process OS, template, portability, SQLite, CLI materializer, build, lint 검사가 포함됩니다. 실패한 검사를 해결하기 전에는 프로젝트 이름 변경이나 기능 개발을 시작하지 않습니다.

## 2. 기존 코드 저장소 초기화

Goodz checkout에서 대상 저장소 경로를 지정합니다.

```bash
pnpm goodz -- init --name "Acme Portal" --root /path/to/existing-repository
pnpm goodz -- verify --root /path/to/existing-repository
```

`init`은 다음 파일을 만들지만 앱 코드를 복사하지 않습니다.

```text
goodz.config.json              Reference 0개, Operations DB 기준
.goodz/workspace.json          Workspace ID와 독립 SQLite 경로
.goodz/data/.gitignore         DB/WAL 제외
docs/00-process/README.md      프로젝트 운영 문서 시작점
docs/projects/README.md        승인 산출물 생성 위치
```

Goodz의 Sprint·IN·CR·TL·Metrics는 `references/goodz-internal`에 남고 대상 저장소에는 복사되지 않습니다. `--force`는 기존 설정을 덮어쓰므로 diff와 백업 없이 사용하지 않습니다.

기존 모노레포의 앱과 타입 패키지를 먼저 분석하려면 `adopt`를 사용합니다.

```bash
pnpm goodz -- adopt --root /path/to/existing-repository
pnpm goodz -- adopt --root /path/to/existing-repository --apply
pnpm goodz -- verify --root /path/to/existing-repository
```

첫 명령은 읽기 전용 계획이며 두 번째 명령에서만 설정을 생성합니다. 자동 탐지 결과는 도입 초안이므로 `goodz.config.json`의 Reference 경계를 검토한 뒤 커밋합니다.

기존 Goodz config v1 저장소는 적용 전에 migration 계획을 확인합니다.

```bash
pnpm goodz -- config migrate --root . --dry-run
pnpm goodz -- config migrate --root .
```

## 3. 조직·프로젝트 설정

Goodz 브랜드와 `@goodz/process` 계약은 유지하고 도입 조직의 정보와 Reference를 설정합니다.

| 순서 | 대상 | 바꿀 내용 |
|------|------|-----------|
| 1 | `goodz.config.json` | edition, 플랫폼 경계, 사용하는 Reference |
| 2 | `docs/00-process/NORTH_STAR.md` | 도입 조직의 목표와 만드는 것/만들지 않는 것 |
| 3 | `docs/01-planning/PRD.md` | 사용자, 문제, 범위, 성공 기준 |
| 4 | `PROJECT.md` | 조직 프로젝트명, 저장소 링크, 현재 Sprint |
| 5 | Reference 앱 | Commerce Reference 유지·제거 또는 별도 도메인 Reference 추가 |

새 Reference는 자체 타입 패키지와 앱을 추가하되 `@goodz/process`를 수정하지 않습니다. `pnpm check:template`은 플랫폼/Reference 경계를, `pnpm check:portability`는 Core 계약과 Reference 독립성을 검증합니다.

## 4. 런타임 설정

Goodz 소스 checkout에서 새로 초기화한 대상 저장소를 로컬 Dashboard에 연결하려면 다음처럼 Workspace root를 지정합니다.

```bash
GOODZ_WORKSPACE_ROOT=/path/to/existing-repository pnpm --filter @goodz/api-server dev
pnpm --filter @goodz/process-dashboard dev
```

대상 `.goodz/workspace.json`의 SQLite에 프로젝트가 처음부터 누적되며 Goodz 내부 개발 DB와 섞이지 않습니다.

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

포트를 바꾸면 env example, `docs/04-qa/STAGING_RUNBOOK.md`, `references/goodz-internal/status.json`의 `apps`를 함께 갱신합니다.

## 5. 첫 P0 사이클

1. `docs/01-planning/intake/`에 첫 요청을 작성합니다.
2. PRD, USER_STORIES, GA4_EVENTS를 새 제품 기준으로 고칩니다.
3. Dashboard의 Project Workbench에서 PRD와 Task·Deliverable·Evidence를 프로젝트 DB에 기록합니다.
4. 현재 Stage의 완료 조건을 확인하고 GO로 다음 단계에 진입합니다.
5. 승인 후 `goodz export`로 `docs/projects/<project-id>/` Markdown을 생성합니다.

P0 Gate가 통과되기 전에는 P1/P2 산출물을 완료로 표시하지 않습니다. Dashboard와 같은 명령 모델로 프로젝트를 생성하려면 다음을 사용할 수 있습니다.

```bash
pnpm goodz -- project create \
  --name "Acme Portal" \
  --summary "고객 요청과 진행 상태를 관리" \
  --owner "Product Team" \
  --api http://localhost:4000
```

## 6. Dashboard로 첫 사이클 확인

1. `http://localhost:5180`의 **Workspace → 프로젝트**에서 빈 Workspace를 확인합니다.
2. 이름, 목표, Owner와 기본 P0–P4 Template을 선택해 첫 프로젝트를 생성합니다.
3. 현재 Stage의 Task 담당자와 상태를 저장합니다.
4. 모든 Task를 완료하고 Gate 근거와 함께 GO를 선택해 다음 Stage가 시작되는지 확인합니다.
5. Workbench에서 PRD·Design Pack을 승인하고 프로젝트별 실행 기록을 누적합니다.
6. Goodz 자체 개발 저장소에서만 선택적으로 표시되는 **Goodz Reference**는 사용자 프로젝트 운영에 사용하지 않습니다.

Dashboard는 프로젝트별 SQLite Process Run을 변경하는 command UI다. 장문 승인 문서는 `goodz export`로 Git working tree에 생성하고 외부 증거는 원본 시스템 URL로 연결한다. Goodz 내부 `status.json`은 `platform.internalReference`가 있는 개발 저장소에서만 별도 projection으로 읽는다.

PRD와 Design 결과 승인 후 Project ID를 사용해 문서를 materialize합니다.

```bash
pnpm goodz -- export --project PRJ-XXXXXXXX --api http://localhost:4000 --root . --dry-run
pnpm goodz -- export --project PRJ-XXXXXXXX --api http://localhost:4000 --root .
pnpm goodz -- verify --root .
```

생성 파일과 충돌 보호 규칙은 [CLI.md](./CLI.md)를 기준으로 합니다.

팀 프로세스를 바꿀 때는 실행 중 Template을 덮어쓰지 않고 새 버전을 만듭니다.

```bash
pnpm goodz -- template migrate \
  --from TPL-GOODZ-P0-P4-V1 \
  --summary "팀 승인 정책 v2" \
  --api http://localhost:4000
```

기존 프로젝트는 v1 실행 정의를 유지하고 이후 프로젝트부터 반환된 v2 ID를 선택합니다.

승인 문서를 검토 가능한 GitHub Pull Request로 전달할 때는 먼저 dry-run을 확인합니다.

```bash
pnpm goodz -- git publish --project PRJ-XXXXXXXX --root . --dry-run
GOODZ_GITHUB_TOKEN=<token> pnpm goodz -- git publish --project PRJ-XXXXXXXX --root .
```

이 명령은 깨끗한 작업 트리에서 승인 export 파일만 별도 branch에 commit한다. 다른 로컬 변경이 있으면 먼저 별도 커밋하거나 보관해야 한다.

## 7. 외부 연동

`ga-analytics-harness`는 기본 web-shop에 포함된 GA4 레퍼런스 연동이며 GitHub commit에 고정됩니다. 저장소 밖의 형제 폴더를 요구하지 않으므로 clean clone에서도 설치할 수 있습니다. 이 연동이 필요 없는 제품은 web-shop의 분석 코드와 dependency를 함께 제거합니다. 네트워크가 제한된 환경에서는 조직 내부 registry mirror로 바꾼 뒤 lockfile을 갱신합니다.

GitHub trace sync는 저장소를 바꾼 후 다음 환경 변수를 사용합니다.

```bash
GOODZ_GITHUB_REPO=<owner>/<repository> pnpm sync:github-trace
```

## 온보딩 완료 기준

- [ ] `pnpm install --frozen-lockfile` 성공
- [ ] `pnpm verify` 성공
- [ ] `pnpm check:clean-clone`에서 생성물 없는 복제 설치·CLI·Template·Portability 검증 성공
- [ ] `pnpm goodz -- verify --root .` 성공
- [ ] 기존 저장소라면 `goodz adopt` 계획 검토 후 `--apply` 결과가 의도한 Reference와 일치
- [ ] 4앱 로컬 기동과 기본 URL 확인
- [ ] North Star와 PRD가 새 제품 기준으로 변경됨
- [ ] 첫 intake와 DACI 승인 요청이 `status.json`에 연결됨
- [ ] GitHub CI가 새 저장소에서 green
- [ ] 첫 승인 Project의 Markdown export와 `.goodz/exports` manifest 생성

제품/Reference 경계는 `goodz.config.json`, 템플릿 필수 경로는 `template.config.json`, 검증 구현은 `scripts/validate-template.mjs`가 SSOT입니다.
