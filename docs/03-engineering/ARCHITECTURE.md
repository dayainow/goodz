# Goodz 아키텍처

## 제품 경계

Goodz는 하나의 브랜드 아래 플랫폼과 레퍼런스 구현을 분리한다.

| 영역 | 역할 | 현재 구현 |
|---|---|---|
| **Goodz Core** | Phase, Gate, 산출물, 승인, 추적, 지표, 운영 | `@goodz/process`, Process Dashboard, process API/data |
| **Goodz Cloud** | 호스팅, 협업, Connector, 관리형 업그레이드 | 후속 로드맵 |
| **Goodz Enterprise** | SSO/SCIM, RBAC, 감사, 정책, VPC/온프레미스, SLA | 후속 로드맵 |
| **Goodz Commerce Reference** | 플랫폼 이식성과 E2E 패턴을 증명하는 예제 | `@goodz/types`, web-shop, admin-dashboard, commerce API/data |

결정 근거는 [ADR-003](./ADR/003-platform-commerce-boundary.md), 기계 판독 계약은 루트 `goodz.config.json`을 기준으로 한다.

## 시스템 다이어그램

```text
                         Goodz Core

 docs/status.json ──> process route/data ──> process-dashboard
        │                   │                       │
        │             SQLite operations            │
        └────────────> @goodz/process <─────────────┘

                 Goodz Commerce Reference

 @goodz/types ──> commerce route/data ──> web-shop
        │                   └────────────> admin-dashboard
        └──────── Product / Cart / Checkout only
```

현재 API는 Express 모듈형 모놀리스로 단일 배포한다. `routes/process.ts`와 `routes/commerce.ts`가 책임 경계이며 외부 URL은 호환성을 유지한다. PostgreSQL, Worker, 독립 확장 또는 고객 격리가 필요해질 때 Control Plane을 별도 런타임으로 분리한다.

## 의존 규칙

```text
@goodz/process → process route/data → process-dashboard
@goodz/types   → commerce route/data → web-shop/admin-dashboard
@goodz/ui      → UI 소비 앱
```

- Goodz Core는 Commerce Reference를 import하지 않는다.
- 새로운 Reference는 `@goodz/process` 수정 없이 자체 타입과 앱을 추가한다.
- `@goodz/types`라는 이름은 현재 호환성을 위해 유지하지만 소유 범위는 Commerce Reference다.
- API 명세는 bounded context별 타입 패키지를 명시한다.

## 모노레포

- **pnpm workspace** (`node-linker=isolated`) — 유령 의존성 방지
- **Turborepo** — `dependsOn: ["^build"]` + 로컬/CI 캐시
- **경계 계약** — `goodz.config.json`, `template.config.json`, `pnpm check:template`
- **전체 검증** — `pnpm verify`

## 앱과 패키지 책임

| 대상 | 책임 |
|---|---|
| `apps/api-server` | 현재 단일 런타임 조립, 인증, 정적 서빙 |
| `apps/api-server/src/routes/process.ts` | Goodz Core HTTP 인터페이스 |
| `apps/api-server/src/routes/commerce.ts` | Commerce Reference HTTP 인터페이스 |
| `apps/process-dashboard` | Goodz Core 운영 콘솔 |
| `apps/web-shop` | Commerce Reference B2C UX |
| `apps/admin-dashboard` | Commerce Reference 운영 UX |
| `packages/process` | 도메인 중립 Process OS 계약 |
| `packages/types` | Commerce Reference 계약 |
| `packages/ui` | 공통 UI 컴포넌트 |

## 데이터 소유권

```text
Git 문서/status.json ── 선언·산출물·정책
SQLite              ── 로컬/단일 인스턴스 운영 상태
GitHub/CI           ── 커밋·PR·빌드·릴리스 증거
Dashboard           ── 위 데이터의 운영 projection
```

- Phase, 산출물, 승인, 추적 링크의 현재 SSOT는 Git 기반 문서다.
- SQLite는 문서 인덱스와 incident처럼 실행 중 자주 바뀌는 데이터를 담당한다.
- Enterprise 전환 시 사용자·조직·프로젝트·승인·감사는 PostgreSQL로 이전하고 append-only 감사 이벤트를 추가한다.

## 확장 순서

1. 비커머스 Reference를 설정과 자체 타입만으로 추가해 코어 이식성을 검증한다.
2. `goodz init`, `goodz adopt`, `goodz verify` CLI와 버전 설정 마이그레이션을 제공한다.
3. PostgreSQL + Worker + GitHub Connector를 도입한다.
4. OIDC/RBAC, 감사 로그, 정책 팩, 백업·복구를 추가한다.
5. 실제 고객 요구가 확인되면 Cloud와 Enterprise 배포 토폴로지를 분리한다.

## ADR

- [001 — Turborepo + pnpm 선택](./ADR/001-monorepo-turborepo.md)
- [002 — SQLite 운영 저장소](./ADR/002-sqlite-operations-store.md)
- [003 — Goodz 플랫폼과 Commerce Reference 경계](./ADR/003-platform-commerce-boundary.md)

## 보안 로드맵

- 현재: 선택적 Basic Auth, 개발 CORS
- Core 배포 기준: 제한된 CORS, secrets 분리, 보안 헤더
- Enterprise 기준: OIDC/SAML, SCIM, 조직·프로젝트 RBAC, 감사 보존, 백업·복구, VPC/온프레미스
