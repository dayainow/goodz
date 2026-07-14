# Installable Goodz Core v1.0

- 요청: 남은 작업이 끝날 때까지 단계별 구현·배포
- 목표: 새 checkout과 기존 config 모두에서 재현 가능한 설치·업그레이드
- 범위: config v2 migration, clean-clone Gate, Core/CLI publish metadata
- 비범위: npm registry 실제 publish, Enterprise SSO/RBAC, PostgreSQL
- 승인 기준: migration dry-run·apply·idempotency, clean clone frozen install, 전체 verify, 원격 CI green
