# ADR-006 — Visual Template Builder

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-07-14 |
| 상태 | Accepted |
| 범위 | Goodz Core v0.23 |

## 배경

v0.22의 JSON Builder는 Template 계약을 빠르게 검증하는 데는 유효했지만, 비개발 운영자가 Stage·Task·산출물 구조를 만들기 어렵고 기존 Template을 안전하게 복제하기도 어려웠다. Catalog 응답에는 Stage code가 없어서 원본 정의를 손실 없이 편집 모델로 변환할 수 없었다.

## 결정

1. Template 생성의 기본 UI를 구조화된 Visual Builder로 교체한다.
2. Stage·Task·Deliverable을 카드와 폼으로 추가·삭제한다.
3. Stage 순서는 위/아래 이동으로 명시적으로 관리한다.
4. 기존 Template은 별도 ID의 Copy로 복제해 편집한다. 기존 버전은 수정하지 않는다.
5. Live Blueprint에서 Stage·Task·필수 산출물 수, 단계 흐름과 저장 가능 여부를 보여준다.
6. `ProcessStageTemplate.code`를 Core 계약에 포함해 복제 시 식별자를 보존한다.
7. 브라우저 검증과 별개로 API도 code, 개수, 필수 필드와 길이 제한을 검증한다.

## 결과

- 운영자는 JSON 문법을 알지 못해도 팀 프로세스를 구성할 수 있다.
- 기존 실행이 참조하는 Template은 불변으로 남고, 변경안은 새 Template으로 저장된다.
- drag-and-drop, 임시 Draft 저장, version migration은 후속 범위다.
