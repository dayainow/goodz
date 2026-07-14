# P0 — Internal Service Catalog PRD

## 문제

내부 플랫폼 팀은 서비스 소유자, 중요도와 런북 위치를 빠르게 확인할 수 있어야 한다. 정보가 저장소와 문서에 흩어지면 장애 대응과 인수인계가 느려진다.

## 목표

- 서비스 목록과 단건 조회 API 제공
- 모든 서비스에 owner, tier, lifecycle, repository, runbook 기록
- Commerce 모델이나 Goodz Core 코드 수정 없이 구현

## 비목표

- 인증/권한 구현
- 실시간 Catalog 동기화
- 프로덕션 데이터베이스

## 성공 기준

- `GET /api/services`가 자체 타입 계약과 일치
- 2개 이상의 fixture와 owner/runbook 보유
- `pnpm check:portability`와 `pnpm verify` 통과
