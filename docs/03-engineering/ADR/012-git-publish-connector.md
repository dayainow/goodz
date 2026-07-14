# ADR-012 — Git Publish Connector

## 상태

Accepted — 2026-07-14

## 배경

승인 bundle을 만들고도 운영자가 매번 branch·add·commit·push·PR을 수동 수행하면 파일 범위를 잘못 포함하거나 승인되지 않은 변경을 섞을 수 있다.

## 결정

- `goodz git publish`는 깨끗한 작업 트리에서 시작한다.
- materializer가 반환한 Markdown과 project manifest만 allowlist로 staging한다.
- Git은 shell 없이 인자 배열로 실행한다.
- 기본은 별도 branch·commit·push·GitHub PR 생성이며 dry-run과 축소 모드를 제공한다.
- PR 생성은 `GOODZ_GITHUB_TOKEN` 또는 `GITHUB_TOKEN`이 있을 때만 수행한다.
- 외부 작업 실패 시 로컬 branch와 파일을 보존해 조사와 수동 재개가 가능하게 한다.

## 보안 경계

임의 shell command, 임의 staging path, 비 GitHub PR remote를 허용하지 않는다. API 서버는 계속 저장소 권한을 갖지 않으며 Git 권한은 CLI 실행 환경에만 둔다.
