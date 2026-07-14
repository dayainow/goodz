# ADR-003 — Goodz 플랫폼과 Commerce Reference 경계

- 상태: Accepted
- 날짜: 2026-07-13
- 결정자: Goodz

## 배경

Goodz의 제품은 P0–P4 프로세스, Gate, 산출물, 승인, 추적과 운영 대시보드다. 그러나 기존 구조에서는 `@goodz/types`와 `api-server`가 플랫폼 계약과 쇼핑몰 계약을 함께 소유해 다른 산업의 레퍼런스를 추가할 때 코어 수정이 필요했다.

## 결정

1. 제품명은 **Goodz**로 유지한다.
2. 제품군은 **Goodz Core / Goodz Cloud / Goodz Enterprise**로 구분한다.
3. 쇼핑몰 구현은 **Goodz Commerce Reference**로 명명한다.
4. Process OS 계약은 `@goodz/process`가 소유한다.
5. `@goodz/types`는 Commerce Reference의 상품·장바구니·체크아웃 계약만 소유한다.
6. 현재 API는 하나의 배포 단위를 유지하되 `routes/process.ts`와 `routes/commerce.ts`로 모듈 경계를 둔다.
7. 두 번째 레퍼런스는 `@goodz/process`를 수정하지 않고 설정·자체 타입·라우터로 추가할 수 있어야 한다.

## 의존 방향

```text
Goodz Core
@goodz/process → process route/data → process-dashboard

Goodz Commerce Reference
@goodz/types → commerce route/data → web-shop/admin-dashboard
```

참조 구현이 플랫폼을 import할 수는 있지만 플랫폼은 참조 구현을 import하지 않는다. `goodz.config.json`과 `template.config.json`은 이 경계를 기계 판독 가능한 계약으로 기록한다.

## 단계적 API 분리

- 현재: Express 모듈형 모놀리스, 단일 포트와 단일 배포
- 다음: Control Plane 저장소가 PostgreSQL/Worker를 요구할 때 프로세스 런타임 분리
- 이후: 고객별 VPC·온프레미스 요구가 검증될 때 별도 배포 패키지 제공

라우터 경계만으로 충분한 동안 네트워크 서비스 분리는 하지 않는다.

## 결과

- Process Dashboard는 커머스 타입에 의존하지 않는다.
- 커머스 앱은 Process OS 타입에 의존하지 않는다.
- API URL 호환성을 유지하면서 내부 책임을 분리한다.
- `@goodz/types`가 모든 타입의 SSOT라는 기존 표현은 폐기하고, 각 bounded context별 SSOT를 사용한다.

## 후속 작업

- Goodz Core 설정 마이그레이션과 CLI (`init`, `adopt`, `verify`)
- 비커머스 Reference 1종으로 이식성 검증
- PostgreSQL + Worker 전환 기준 ADR
- OIDC/RBAC, 감사 로그, 정책 팩
