# Git Materializer & Goodz CLI v0.26

| 항목 | 내용 |
|---|---|
| 요청일 | 2026-07-14 |
| 상태 | done |
| 대상 | Goodz CLI · Export · Onboarding |

## 요청

승인된 PRD와 Design Pack bundle을 사용자가 수동으로 풀지 않고 실제 저장소 파일로 만들고, 신규 프로젝트에서 Goodz를 초기화·검증할 수 있는 CLI 기반을 제공한다.

## 수용 기준

- `goodz init`, `goodz project create`, `goodz export`, `goodz verify`가 동작한다.
- export는 `docs/projects/` 아래 Markdown과 hash manifest를 생성한다.
- 로컬 수정, 경로 탈출, symbolic link 경로를 기본 차단한다.
- dry-run과 명시적 force를 지원한다.
- CLI 단위 테스트와 실제 Process API smoke가 통과한다.

## 후속

Template migration, `goodz adopt`, 자동 Git branch/commit/PR Connector를 구현한다.
