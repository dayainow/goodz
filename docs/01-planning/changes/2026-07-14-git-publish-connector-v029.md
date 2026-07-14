# v0.29 Git Publish Connector 변경

## 변경

- `goodz git publish` 명령
- 승인 export 파일 allowlist와 unrelated change 차단
- branch/commit/push와 GitHub Pull Request API
- dry-run, local-only, push-only 모드
- Git remote·ref·token preflight와 테스트

## 결정

Git 자동화 권한은 API 서버가 아니라 사용자의 CLI 환경에 둔다. 자동화는 승인 bundle 범위만 다루며 merge는 기존 저장소 정책에 맡긴다.
