# Writable Process MVP v0.21 입력

- 요청일: 2026-07-14
- 요청: Process Dashboard를 단순 조회 화면이 아니라 사용자가 프로세스를 관리하는 제품으로 확장
- 목표: 프로젝트 생성 → 템플릿 실행 → 단계·작업 변경 → GO/HOLD/KILL Gate 결정의 최소 루프 제공
- 범위: `@goodz/process` 계약, SQLite schema v2, Process API, Dashboard 프로젝트 메뉴, 감사 이력, 문서·검증
- 비범위: 다중 사용자 인증, Template Builder, 파일 업로드, 외부 Connector, PostgreSQL
- 승인 기준: 작업 미완료 GO 차단, GO 후 다음 단계 자동 시작, HOLD/KILL 사유 기록, `pnpm verify` 통과
