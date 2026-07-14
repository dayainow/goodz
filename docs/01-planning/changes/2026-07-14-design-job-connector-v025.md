# CR-024 — Design Job Connector & Export v0.25

| 항목 | 내용 |
|---|---|
| 요청일 | 2026-07-14 |
| 상태 | applied |
| 승인 | AP-024 |

## 변경

- `ProcessDesignJob` Core 계약과 SQLite schema v5를 추가한다.
- 수동 Claude Design 어댑터를 상태 있는 command loop로 제공한다.
- 결과 제출과 수정 요청, 승인 이력을 SQLite audit에 기록한다.
- 승인된 프로젝트를 3개 Markdown 파일이 포함된 portable JSON bundle로 내보낸다.
- 기존 Design Pack URL 직접 입력은 호환 필드로 유지하되, 신규 승인은 제출된 Design Job을 요구한다.

## 결정

외부 서비스 인증 정보가 없는 Core는 Claude Design을 자동 호출했다고 가장하지 않는다. 수동 어댑터가 동일한 계약을 먼저 증명하고, 후속 MCP/API 어댑터가 같은 command model을 구현한다.
