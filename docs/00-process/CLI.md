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

## 인증과 API

기본 API는 `http://localhost:4000`이며 다음 환경 변수로 바꿀 수 있습니다.

```bash
GOODZ_API_URL=https://goodz.example.com
GOODZ_BASIC_AUTH_USER=operator
GOODZ_BASIC_AUTH_PASSWORD=secret
```

사용자와 비밀번호는 반드시 함께 설정합니다.

## Git 경계

v0.27은 기존 저장소 분석과 적용까지 지원하고 Git에 넣을 파일을 안전하게 생성하지만 `git add`, `commit`, `push`는 자동 실행하지 않습니다. 사용자가 diff를 검토한 뒤 기존 승인·CI 정책으로 커밋합니다. 자동 branch/commit/PR 생성은 후속 Git Connector 범위입니다.
