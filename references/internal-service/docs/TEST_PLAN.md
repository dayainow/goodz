# P3 — Internal Service Test Plan

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| IS-01 | `pnpm --filter @goodz/internal-service-api check` | fixture와 owner/runbook 검증 통과 |
| IS-02 | `GET /health` | `ok: true` |
| IS-03 | `GET /api/services` | 2개 이상의 서비스 반환 |
| IS-04 | 존재하는 서비스 조회 | `200` + `ManagedService` |
| IS-05 | 없는 서비스 조회 | `404` |
| IS-06 | `pnpm check:portability` | Core 해시·P0–P4·독립 타입 검사 통과 |

## 회귀 기준

- `packages/process` 기준선 해시 불변
- Commerce 용어와 `@goodz/types` 의존성 없음
- 전체 `pnpm verify` 통과
