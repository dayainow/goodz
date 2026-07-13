# Delivery Metrics — DORA Baseline

Goodz v0.7의 목표는 `traceLinks`, CI run, smoke 증거를 운영 판단용 지표로 바꾸는 것입니다.  
초기 버전은 정밀한 성과 평가가 아니라 **프로세스 건강도와 다음 액션을 보는 베이스라인**입니다.

## 지표 원칙

| 원칙 | 설명 |
|------|------|
| 판단 우선 | 숫자를 예쁘게 만드는 것보다 다음 액션을 알 수 있어야 함 |
| 증거 기반 | `traceLinks`, GitHub CI, smoke 기록에서 계산 |
| 작은 시작 | 날짜 단위 계산으로 시작하고, 추후 timestamp를 저장해 시간 단위로 고도화 |
| 팀 보호 | 개인 평가용이 아니라 병목·품질·복구 체계 개선용 |

## v0.7 지표

| 지표 | Goodz 계산 기준 |
|------|-----------------|
| Deployment frequency | Release URL 또는 smoke pass가 있는 trace 수 |
| Lead time for changes | 변경 요청일 → 승인/smoke 증거일까지의 날짜 단위 평균 |
| CI success rate | `traceLinks[].ciRuns` 중 success 비율 |
| Change failure rate | 실패 CI 또는 실패 smoke가 배포 후보에서 차지하는 비율 |
| MTTR | 실패 후 복구 기록이 생기면 계산. 현재는 `N/A` |
| Evidence completeness | 대시보드 `증거` 메뉴의 누락 경고를 반영한 trace 건강도 |
| Smoke pass rate | 기록된 smoke 증거 중 passed 비율 |
| Trace coverage | linked/released 상태 trace 비율 |

## 대시보드

Process Dashboard `지표` 메뉴에서 확인합니다.

- DORA 원형 카드: 배포 빈도, 리드타임, CI 성공률, 변경 실패율, MTTR
- Goodz 보조 카드: 증거 완성도, smoke pass rate, trace coverage
- trace별 리드타임 테이블: 요청일, 증거일, lead time, CI, smoke, 증거 경고

## 현재 한계

- GitHub run timestamp를 `status.json`에 저장하지 않으므로 CI까지의 시간은 아직 계산하지 않습니다.
- 날짜 단위 계산이라 같은 날 처리된 작업은 `0d`로 표시됩니다.
- MTTR은 실패와 복구 이벤트가 모두 있어야 의미가 있습니다.

## 다음 고도화

1. `sync:github-trace`가 CI run `created_at`, `updated_at`, `conclusion`을 저장
2. PR created/merged timestamp를 가져와 lead time을 시간 단위로 계산
3. smoke 실패와 복구 기록을 별도 incident로 남겨 MTTR 계산
4. Metrics snapshot을 주간/스프린트 단위로 저장
