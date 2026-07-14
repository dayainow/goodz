# Immutable Template Migration v0.28

- 요청: 남은 단계를 순차 구현하고 각 단계 배포
- 목표: 프로세스 변경 시 기존 실행의 재현성을 보존
- 범위: Template 새 버전 API·CLI, audit, 기존/신규 Run version 고정 검증
- 비범위: 실행 중 Run의 Task 구조 변환, 자동 최신 버전 전환
- 승인 기준: v1→v2 생성, 원본 불변, 기존 Run v1·신규 Run v2, `pnpm verify`
