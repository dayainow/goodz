# ADR-009 — Git Materializer와 Goodz CLI 경계

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-07-14 |
| 상태 | Accepted |
| 범위 | Goodz v0.26 |

## 배경

v0.25는 승인 산출물을 경로와 Markdown content가 포함된 JSON bundle로 반환했다. 사용자가 이를 직접 파일로 옮기면 경로 실수, 기존 문서 덮어쓰기, export provenance 유실이 발생할 수 있다. Dashboard 서버가 저장소 파일을 직접 쓰게 하면 배포 환경 권한과 임의 파일 쓰기 위험도 커진다.

## 결정

1. 저장소 쓰기는 API 서버가 아니라 사용자의 로컬/CI 환경에서 실행되는 `@goodz/cli`가 담당한다.
2. API는 계속 portable bundle을 반환하고 CLI가 이를 materialize한다.
3. 허용 경로는 `docs/projects/**/*.md`로 제한한다.
4. 절대 경로, 상위 경로 이동과 symbolic link가 포함된 쓰기 경로를 거부한다.
5. `.goodz/exports/<project-id>.json`에 마지막 export hash를 기록한다.
6. 현재 파일 hash가 마지막 export hash와 다르면 로컬 수정으로 판단해 충돌을 반환한다.
7. 서버 변경으로 인한 정상 재-export는 이전 hash가 일치할 때만 원자적으로 덮어쓴다.
8. `--force`와 `--dry-run`은 사용자가 명시한 경우에만 적용한다.
9. CLI는 파일을 생성하지만 Git add/commit/push는 수행하지 않는다.

## 결과

- 승인 산출물이 commit-ready Markdown으로 연결된다.
- Dashboard/API와 저장소 권한 경계가 분리된다.
- 사용자가 수정한 문서를 기본적으로 보호한다.
- 같은 materializer를 로컬, CI, 향후 Git Connector에서 재사용할 수 있다.
