# Delivery Metrics — DORA Baseline

Goodz v0.9의 목표는 `traceLinks`, CI run, smoke 증거를 운영 판단용 지표로 바꾸고, GitHub timestamp를 이용해 **요청 → 커밋 → CI 성공 → smoke/release** 시간을 계산한 뒤, snapshot으로 저장해 추세를 보는 것입니다.  
이 지표는 성과 평가가 아니라 **프로세스 건강도와 병목을 보는 운영 베이스라인**입니다.

## 지표 원칙

| 원칙 | 설명 |
|------|------|
| 판단 우선 | 숫자를 예쁘게 만드는 것보다 다음 액션을 알 수 있어야 함 |
| 증거 기반 | `traceLinks`, GitHub CI, smoke 기록, metrics snapshot에서 계산 |
| 작은 시작 | timestamp가 있으면 시간 단위, 날짜만 있으면 fallback 계산 |
| 팀 보호 | 개인 평가용이 아니라 병목·품질·복구 체계 개선용 |

## v0.9 지표

| 지표 | Goodz 계산 기준 |
|------|-----------------|
| Deployment frequency | Release URL 또는 smoke pass가 있는 trace 수 |
| Lead time for changes | 변경 요청일 → smoke/release 증거까지의 시간 단위 평균 |
| CI success rate | `traceLinks[].ciRuns` 중 success 비율 |
| Change failure rate | 실패 CI 또는 실패 smoke가 배포 후보에서 차지하는 비율 |
| MTTR | 실패 후 복구 기록이 생기면 계산. 현재는 `N/A` |
| Evidence completeness | 대시보드 `증거` 메뉴의 누락 경고를 반영한 trace 건강도 |
| Smoke pass rate | 기록된 smoke 증거 중 passed 비율 |
| Trace coverage | linked/released 상태 trace 비율 |

## 대시보드

Process Dashboard `지표` 메뉴에서 확인합니다.

- DORA 원형 카드: 배포 빈도, 리드타임, CI 성공률, 변경 실패율, MTTR
- Snapshot trend: 저장된 snapshot의 lead time, CI success, evidence completeness, trace coverage 추세
- Goodz 보조 카드: 증거 완성도, smoke pass rate, trace coverage
- trace별 리드타임 테이블: 요청→커밋, 커밋→CI, CI→증거, 전체 lead time

## Snapshot 운영

지표 기준점을 남길 때 실행합니다.

```bash
pnpm snapshot:metrics
```

생성 파일:

```text
docs/00-process/metrics-snapshots.json
```

검증:

```bash
pnpm snapshot:metrics:check
pnpm check:process
```

snapshot은 현재 `status.json`과 Git HEAD를 기준으로 아래 값을 저장합니다.

- trace 수, linked/released trace 수, evidence issue 수
- deployment frequency, lead time, CI success rate, change failure rate
- smoke pass rate, trace coverage, evidence completeness, MTTR placeholder

## 현재 한계

- 과거 trace 중 smoke/release timestamp가 없는 항목은 배포까지의 총 lead time을 계산하지 않습니다.
- `checkedAt`이 날짜만 있으면 해당 날짜의 끝 시각을 fallback으로 사용합니다.
- MTTR은 실패와 복구 이벤트가 모두 있어야 의미가 있습니다.
- snapshot은 저장 시점의 기준점이므로, 소급 수정이 있으면 새 snapshot을 다시 찍어 비교합니다.

## 다음 고도화

1. smoke 실패와 복구 기록을 별도 incident로 남겨 MTTR 계산
2. Metrics snapshot을 주간/스프린트 단위로 자동 저장
3. PR review/merge lead time과 DACI 승인 lead time을 분리
4. 배포 URL health check와 release timestamp 자동 검증
