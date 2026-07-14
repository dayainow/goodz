# Goodz CLI

Goodz CLI는 기존 코드 저장소에 Process Control Plane 메타데이터를 초기화하고, Dashboard의 프로젝트를 생성하며, 승인 산출물을 Git에 넣을 수 있는 Markdown 파일로 materialize합니다.

현재 모노레포에서는 다음 형식으로 실행합니다.

```bash
pnpm goodz -- <command>
```

패키지 binary를 연결한 환경에서는 `goodz <command>`를 사용합니다.

## 명령

### `goodz init`

```bash
pnpm goodz -- init --name "Acme Portal" --root /path/to/repository
```

- 기존 저장소에 `goodz.config.json`을 생성합니다.
- `docs/projects/`와 `.goodz/exports/` materialization 경계를 준비합니다.
- 이미 설정이 있으면 중단하며 명시적인 `--force`만 덮어씁니다.
- 애플리케이션 코드를 복사하는 scaffold 명령은 아직 아닙니다.

### `goodz adopt`

```bash
pnpm goodz -- adopt --root /path/to/existing-repository
pnpm goodz -- adopt --root /path/to/existing-repository --apply
```

- 기존 `package.json`, `apps/`, `packages/`, `references/`를 읽어 Reference와 타입 패키지 후보를 탐지합니다.
- 기본 실행은 계획만 출력하며 파일을 변경하지 않습니다.
- `--apply`를 지정해야 `goodz.config.json`, `docs/projects/`, `.goodz/exports/`를 생성합니다.
- 기존 설정은 보호하며 `--force`를 함께 지정한 경우에만 교체합니다.
- 앱 코드, 의존성, workspace 설정은 자동 변경하지 않습니다.

### `goodz project create`

```bash
pnpm goodz -- project create \
  --name "고객 포털" \
  --summary "고객 요청과 진행 상태를 한 곳에서 관리" \
  --owner "Product Team" \
  --template TPL-GOODZ-P0-P4-V1 \
  --api http://localhost:4000
```

`--template`을 생략하면 API가 제공하는 첫 Template을 사용합니다. 성공하면 Project ID와 Run ID를 출력합니다.

### `goodz template migrate`

```bash
pnpm goodz -- template migrate \
  --from TPL-GOODZ-P0-P4-V1 \
  --summary "승인 정책이 추가된 v2" \
  --api http://localhost:4000
```

- 원본 Template을 수정하지 않고 다음 version ID로 복제합니다.
- 기존 Run은 원래 version에 고정됩니다.
- 새 프로젝트는 반환된 새 Template ID를 명시해 시작합니다.
- 이름과 요약만 CLI에서 선택적으로 바꾸며 Stage 편집은 Template Builder에서 새 초안을 구성한 뒤 별도 version 정책으로 관리합니다.

### `goodz export`

```bash
pnpm goodz -- export \
  --project PRJ-XXXXXXXX \
  --api http://localhost:4000 \
  --root .
```

Design 승인까지 끝난 프로젝트에서 다음 파일을 생성합니다.

```text
docs/projects/<project-id>/PRD.md
docs/projects/<project-id>/DESIGN_PACK.md
docs/projects/<project-id>/CLAUDE_DESIGN_HANDOFF.md
.goodz/exports/<project-id>.json
```

- `--dry-run`: 파일을 쓰지 않고 생성·변경 예정 항목만 계산합니다.
- `--force`: 사용자가 수정한 파일도 명시적으로 덮어씁니다.
- 기본 동작은 마지막 manifest hash와 현재 파일 hash를 비교해 로컬 수정을 보호합니다.
- 절대 경로, `..` 경로, `docs/projects/` 밖의 파일과 symbolic link 경로는 거부합니다.
- 파일은 임시 파일을 쓴 뒤 rename해 원자적으로 교체합니다.

### `goodz verify`

```bash
pnpm goodz -- verify --root .
pnpm goodz -- verify --root . --full
```

기본 검증은 `goodz.config.json`, Core hash와 materialized export manifest를 확인합니다. `--full`은 이어서 저장소의 `pnpm verify`를 실행합니다.

### `goodz git publish`

```bash
GOODZ_GITHUB_TOKEN=<token> pnpm goodz -- git publish \
  --project PRJ-XXXXXXXX \
  --root /path/to/repository \
  --api http://localhost:4000 \
  --base main
```

승인 bundle을 materialize한 뒤 `goodz/<project-id>` 브랜치, 제한된 파일 commit, remote push와 GitHub Pull Request를 순서대로 생성합니다.

- 시작 전 작업 트리가 깨끗해야 합니다.
- 승인 bundle의 Markdown과 해당 hash manifest 외 변경이 발견되면 중단합니다.
- Git 명령은 shell 문자열이 아니라 고정 인자 배열로 실행합니다.
- `--dry-run`은 파일·브랜치·commit·push·PR을 모두 변경하지 않습니다.
- `--no-pr`은 branch와 push까지만 수행합니다.
- `--no-push --no-pr`은 로컬 branch와 commit만 만듭니다.
- `--branch`, `--message`, `--remote`, `--base`로 기본값을 바꿀 수 있습니다.
- push 또는 PR 실패 시 생성된 로컬 branch와 파일은 삭제하지 않아 운영자가 원인을 확인하고 재개할 수 있습니다.

## 인증과 API

기본 API는 `http://localhost:4000`이며 다음 환경 변수로 바꿀 수 있습니다.

```bash
GOODZ_API_URL=https://goodz.example.com
GOODZ_BASIC_AUTH_USER=operator
GOODZ_BASIC_AUTH_PASSWORD=secret
GOODZ_GITHUB_TOKEN=github_token_for_pull_request
```

사용자와 비밀번호는 반드시 함께 설정합니다.

## Git 경계

v0.29는 기존 저장소 분석·Template migration·안전한 파일 생성에 이어 선택한 승인 bundle만 branch/commit/push/PR로 전달합니다. 기본 `goodz export`는 여전히 Git을 변경하지 않으며 자동 흐름은 명시적인 `goodz git publish`에서만 실행됩니다.
