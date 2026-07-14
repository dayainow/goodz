# Portability Proof v0.20 입력

| 항목 | 내용 |
|---|---|
| 요청 | 비커머스 Reference 1종을 Goodz Core 수정 없이 추가 |
| 목표 | Commerce 예제와 무관한 도메인에서도 Core 경계를 유지함을 실행 코드로 증명 |
| 선택 도메인 | 사내 서비스 카탈로그 API |
| 성공 기준 | Core diff 0건, 자체 타입, P0–P4 산출물, 전체 verify, 런타임 smoke |

## 범위

- `references/internal-service` 독립 Reference
- `@goodz/internal-service-types`
- Node 서비스 카탈로그 API
- Core SHA-256 기준선과 `pnpm check:portability`
- Roadmap, Gate, Architecture, README 갱신

## 비범위

- Goodz Core 모델 변경
- PostgreSQL/Worker
- CLI init/adopt/verify
- 외부 배포
