# Goodz Internal Service Reference

사내 서비스 카탈로그를 예제로 사용하는 **비커머스 Reference**입니다. Goodz Core의 이식성을 검증하기 위해 추가했으며 상품·장바구니·체크아웃 모델을 사용하지 않습니다.

## 구성

```text
packages/types → apps/api
docs/PRD.md → docs/API.md → docs/TEST_PLAN.md → docs/RELEASE_CHECKLIST.md
```

| 경로 | 역할 |
|---|---|
| `goodz.reference.json` | Reference 계약과 P0–P4 증거 |
| `packages/types` | Service/Owner/Tier 타입 SSOT |
| `apps/api` | Node HTTP 서비스 카탈로그 API |
| `docs` | Reference 전용 P0–P4 산출물 |

## 실행

```bash
pnpm --filter @goodz/internal-service-api build
PORT=4200 pnpm --filter @goodz/internal-service-api start
curl http://localhost:4200/api/services
```

## 이식성 판정

`pnpm check:portability`는 다음을 검사합니다.

- Goodz Core v0.5.0 계약 해시가 기준선과 같은가
- Reference가 `goodz.config.json`에 등록됐는가
- 자체 타입과 앱이 Commerce 타입에 의존하지 않는가
- P0–P4 문서가 모두 존재하고 완료 상태인가
- `coreChangesRequired`가 `false`인가
