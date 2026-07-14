# Git Publish Connector v0.29

- 요청: 남은 단계를 끝까지 구현하고 단계별 배포
- 목표: 승인 산출물을 검토 가능한 Git branch와 PR로 안전하게 전달
- 범위: clean tree, allowlist staging, branch, commit, push, GitHub PR, dry-run
- 비범위: 자동 merge, 보호 브랜치 우회, 비 GitHub provider
- 승인 기준: unit test, bare remote branch/push smoke, PR API contract, `pnpm verify`
