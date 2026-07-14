# ADR-013 — Installable Goodz Core v1.0

## 상태

Accepted — 2026-07-14

## 배경

기능이 동작해도 로컬 build 산출물에 기대거나 설정 upgrade 경로가 없으면 새 조직이 재현 가능하게 설치할 수 없다.

## 결정

- Goodz config v2에 export·manifest·Git 전달 기본 정책을 선언한다.
- `goodz config migrate`가 v1을 dry-run 후 원자적으로 v2로 올린다.
- migration은 반복 실행해도 추가 변경이 없는 멱등 command다.
- `pnpm check:clean-clone`은 dist/node_modules 없이 복사한 workspace에서 offline frozen install과 CLI·Template·Portability Gate를 실행한다.
- `@goodz/process`와 `@goodz/cli`를 v1.0 publish-ready metadata로 정리한다.

## 결과

Goodz Core v1.0의 의미는 Enterprise 기능 완료가 아니라 설치·도입·업그레이드·이식성 계약의 안정화다. SSO/RBAC, 감사 로그, PostgreSQL/Worker와 SLA는 후속 Enterprise Gate다.
