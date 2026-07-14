# Goodz Core 이식성 검증

Goodz Core가 Commerce 도메인에 결합되지 않았음을 비커머스 Reference로 지속 검증하는 운영 기준이다.

## 기준선

| 항목 | 값 |
|---|---|
| 기준 커밋 | `aa6c1a9` — Goodz Core와 레퍼런스 경계 분리 |
| Core 패키지 | `@goodz/process` v0.6.0 |
| 계약 파일 | `packages/process/src/index.ts` |
| SHA-256 | `fbf74907c7b08ce1d757604421ed20df44fdde18c2f99f35bbe45727361b13ff` |
| 비커머스 증거 | `references/internal-service` |

기준선 값의 SSOT는 `goodz.config.json`의 `portability.coreContract`다. Core를 의도적으로 변경할 때는 버전, hash, 호환성 검토와 migration 문서를 함께 갱신해야 한다.

## 검증 명령

```bash
pnpm check:portability
```

검증기는 다음을 확인한다.

1. Core 계약 hash가 기준선과 일치한다.
2. Internal Service Reference가 `goodz.config.json`에 등록돼 있다.
3. Reference가 자체 타입 패키지를 사용한다.
4. Reference 코드가 Commerce 타입과 상징에 의존하지 않는다.
5. P0–P4 산출물이 존재하고 완료 상태다.
6. Reference fixture의 owner/runbook 계약이 유효하다.

## 이식성 결과

```text
Goodz Core v0.6.0       기준선 일치
Internal Service 타입   신규 독립 패키지
Internal Service API    신규 독립 앱
P0–P4 산출물            5종 완료
Commerce 의존성         0건
```

## 새로운 Reference 추가 규칙

1. `references/<id>/goodz.reference.json`을 만든다.
2. Reference 자체 타입과 앱을 둔다.
3. `goodz.config.json`에 등록한다.
4. P0–P4 산출물을 manifest에 연결한다.
5. `@goodz/process` 수정 없이 `pnpm verify`를 통과한다.

Core 수정이 필요하면 Reference 도입이 아니라 Core 기능 제안으로 분리하고 별도 ADR과 migration을 작성한다.
