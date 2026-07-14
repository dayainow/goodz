# Design Job Connector & Export v0.25

| 항목 | 내용 |
|---|---|
| 요청일 | 2026-07-14 |
| 상태 | done |
| 대상 | Goodz Core · API · Process Dashboard |

## 요청

PRD와 MVP Design Pack을 만든 다음 Claude Design 제작을 실제 운영 작업처럼 시작·추적·검토하고, 승인 결과를 이식 가능한 문서 묶음으로 내보낸다.

## 수용 기준

- 승인 PRD와 완성된 Design Pack만 Claude Design 작업을 생성할 수 있다.
- 작업은 전달 대기, 작업 중, 결과 검토, 수정 필요, 승인 완료 상태를 가진다.
- Claude Design URL을 결과로 제출한 뒤에만 Design Pack을 승인할 수 있다.
- PRD나 Design Pack 변경 시 열려 있는 Design Job은 수정 필요가 된다.
- 승인 후 PRD, Design Pack, handoff prompt snapshot을 Markdown 파일 묶음으로 내보낼 수 있다.

## 후속

MCP/API 인증을 사용하는 자동 Claude Design 어댑터와 Git commit export를 추가한다.
