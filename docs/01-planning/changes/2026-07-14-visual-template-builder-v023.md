# Visual Template Builder v0.23 변경

## 적용 내용

1. JSON textarea 기반 Builder를 Stage 카드 중심 Visual Builder로 교체했다.
2. Stage·Task·Deliverable 추가·삭제와 Stage 위/아래 순서 변경을 제공한다.
3. 기본 및 사용자 Template을 새 Copy로 복제 편집할 수 있다.
4. Live Blueprint에서 Stage, Task, 필수 산출물 수와 저장 가능 여부를 표시한다.
5. `ProcessStageTemplate.code`를 Core 응답 계약에 추가했다.
6. API에 최대 개수, code 중복/형식, 필수 필드와 길이 제한을 추가했다.

## 검증

- Process Core/API/Dashboard TypeScript 계약
- P0–P4와 Phase 0–8 Stage code 보존
- 중복 Stage code 생성 차단
- 사용자 Template 생성과 SQLite persistence
- production Dashboard build
- `pnpm verify`
