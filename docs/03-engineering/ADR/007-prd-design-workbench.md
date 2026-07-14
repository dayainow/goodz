# ADR-007 — PRD & Design Workbench 경계

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-07-14 |
| 상태 | Accepted |
| 범위 | Goodz Core v0.24 |

## 배경

사용자가 Process Run을 시작해도 PRD는 빈 문서에서 따로 작성해야 했고, 디자인 단계는 기존 문서와 Claude Design 링크를 조회하는 수준이었다. Goodz가 모든 세부 디자인을 직접 제작하면 Claude Design과 역할이 겹치지만, 단순 가이드만 제공하면 P0/P1 작업이 실제 command loop에 들어오지 않는다.

## 결정

1. Goodz는 질문형 PRD 작성, Markdown 합성, 승인과 변경 이력을 관리한다.
2. Goodz는 high-fidelity 제작 전 화면 구조, 스토리보드와 디자인 콘셉트를 관리한다.
3. Claude Design은 high-fidelity 화면과 상세 UI 제작을 담당한다.
4. Goodz는 승인 PRD와 Design Pack을 Claude Design handoff prompt로 합성한다.
5. Claude Design 결과는 URL로 회수하고 Design Pack 승인 상태로 관리한다.
6. PRD 수정 시 PRD와 downstream Design 승인을 함께 Draft로 되돌리고, Design Pack 수정 시 Design 승인만 되돌린다.
7. 승인 전 초안은 SQLite, 승인된 원본의 Git/Notion export는 후속 Connector 범위로 둔다.

Design Job 상태와 portable export는 후속 [ADR-008](./008-design-job-connector-export.md)에서 구현한다.

## 결과

- 사용자는 빈 PRD 문서 대신 질문에 답해 P0 초안을 완성한다.
- P1은 와이어프레임·스토리보드·콘셉트 → Claude Design → 결과 승인으로 연결된다.
- Goodz와 Claude Design의 제품 경계가 명확해진다.
