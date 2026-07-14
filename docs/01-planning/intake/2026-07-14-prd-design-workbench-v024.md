# PRD & Design Workbench v0.24 입력

- 요청일: 2026-07-14
- 출처: 사용자 요청 — PRD 작성 가이드와 Claude Design 중심 디자인 제작 흐름 구현
- 목표: 사용자가 아이디어에서 승인 PRD, MVP 디자인 준비와 Claude Design 결과까지 Dashboard에서 관리
- 범위: PRD Wizard, Markdown projection, 승인, 화면 명세, 스토리보드, 콘셉트, handoff prompt, 결과 URL, SQLite schema v4, 문서·검증
- 비범위: Claude Design API 자동 호출, 이미지/목업 생성, Git/Notion 자동 export, 공동 편집, RBAC
- 완료 기준: 빈 PRD 승인 차단, PRD 승인, Design 선행 guard, handoff 생성, 결과 URL 승인, `pnpm verify`
