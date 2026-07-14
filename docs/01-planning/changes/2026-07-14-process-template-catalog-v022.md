# Process Template Catalog v0.22 변경

## 적용 내용

1. 하드코딩된 P0–P4 정의를 `templates/process/goodz-product-delivery.json`으로 이동했다.
2. 판단→범위→아키텍처→작업→구현→품질→배포→시장 검증→사업 산출물의 Phase 0–8 Template을 추가했다.
3. `@goodz/process`에 Template Deliverable, Run Deliverable, Evidence와 command 계약을 추가했다.
4. SQLite schema v3에 산출물·증거 저장 모델과 Template Builder 저장 경로를 추가했다.
5. 모든 Task 완료와 필수 산출물 승인 전에는 GO가 불가능하도록 Gate guard를 강화했다.
6. Dashboard에 Catalog, JSON Builder, 산출물 제출·승인과 증거 연결 UI를 추가했다.

## 검증

- 파일 기반 Template 2종과 Phase 0–8의 정확한 9개 Stage
- 사용자 Template SQLite 저장
- Phase 건너뛰기와 미완료 Task GO 차단
- 필수 산출물 승인 전 GO 차단
- 산출물 승인, CI 증거 제출과 다음 Stage 자동 시작
- `pnpm verify`
