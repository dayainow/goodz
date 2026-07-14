# ADR-005 — Process Template Catalog와 산출물 Gate

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-07-14 |
| 상태 | Accepted |
| 범위 | Goodz Core v0.22 |

## 배경

v0.21의 P0–P4 Template은 API Store 코드에 고정되어 있어 다른 프로세스를 추가할 때 Core 구현을 수정해야 했다. 또한 Task 완료만으로 GO가 가능해 실제 산출물과 검증 증거가 실행 상태에서 분리됐다.

## 결정

1. 저장소 기본 Template은 `templates/process/*.json` 파일로 정의한다.
2. P0–P4와 서비스 전달 Phase 0–8을 같은 계약으로 제공한다.
3. Dashboard Builder가 만든 Template은 같은 계약으로 검증해 SQLite에 저장한다.
4. Stage Run은 Task 외에 Deliverable과 Evidence를 소유한다.
5. GO는 모든 Task 완료와 모든 필수 Deliverable 승인을 요구한다.
6. Evidence는 원본을 복제하지 않고 외부/저장소 URI와 설명을 기록한다.

## 결과

- 새 기본 프로세스는 Core TypeScript를 수정하지 않고 JSON 파일 추가만으로 배포할 수 있다.
- 사용자는 프로세스, 산출물과 증거를 한 실행 화면에서 관리할 수 있다.
- JSON Builder는 최소 구현이며 시각적 편집, version migration과 정책 팩은 후속 범위다.
