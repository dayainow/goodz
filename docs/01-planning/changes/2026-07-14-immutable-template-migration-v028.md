# v0.28 Immutable Template Migration 변경

## 변경

- Core 0.7.0 Template migration request/response 계약
- Template version 생성 API와 audit event
- `goodz template migrate` 명령
- v1 Run 고정과 v2 신규 Run 실행 검증

## 결정

실행 중 프로세스는 소급 변경하지 않는다. 새 정책은 새 Template version으로 만들고 이후 프로젝트가 명시적으로 선택한다.
