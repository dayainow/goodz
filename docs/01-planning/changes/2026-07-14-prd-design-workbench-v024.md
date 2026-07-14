# PRD & Design Workbench v0.24 변경

## 적용 내용

1. `@goodz/process`에 Project Brief, Design Screen, Storyboard와 Design Pack 계약을 추가했다.
2. SQLite schema v4에 프로젝트별 Brief와 Design Pack을 추가하고 기존 Project를 backfill한다.
3. PRD 질문 답변을 Markdown PRD로 합성하고 저장·승인한다.
4. 화면 목적·영역·주요 행동과 Actor·Action·Screen·Outcome 스토리보드를 편집한다.
5. 디자인 콘셉트와 승인 PRD를 Claude Design handoff prompt로 합성한다.
6. Claude Design 결과 URL과 Design Pack을 승인하며 PRD 선행 조건을 검증한다.

## 검증

- 빈 PRD 승인 거부
- 완성 PRD Markdown 생성과 승인
- 빈 Design Pack 및 PRD 미승인 Design 승인 거부
- 화면·스토리보드·콘셉트·handoff URL 저장과 승인
- 기존 Template·Deliverable·Evidence·Gate lifecycle 회귀
- `pnpm verify`
