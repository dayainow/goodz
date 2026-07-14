# ADR-008 — Claude Design Job과 portable export

| 항목 | 내용 |
|---|---|
| 날짜 | 2026-07-14 |
| 상태 | Accepted |
| 범위 | Goodz Core v0.25 |

## 배경

v0.24는 handoff prompt와 결과 URL을 Design Pack 한 행에 저장했다. 이 방식은 제작을 누가 언제 시작했는지, 어떤 prompt 버전으로 결과가 만들어졌는지, 수정 요청 이후 무엇이 바뀌었는지 추적하기 어렵다. 또한 승인 결과를 다른 저장소나 도구로 옮길 표준 산출물이 없었다.

## 결정

1. 디자인 제작 실행을 `ProcessDesignJob`으로 분리한다.
2. Job은 생성 시 handoff prompt snapshot을 고정한다.
3. 기본 Connector는 `manual_claude_design`이다. Goodz가 상태와 증거를 관리하고 사용자가 Claude Design UI에서 제작한다.
4. Job 상태는 `queued → in_progress → submitted → approved`이며 검토 실패는 `changes_requested`로 기록한다.
5. PRD 또는 Design Pack 수정은 열려 있는 Job을 `changes_requested`로 만든다. 이미 승인된 Job은 이력으로 보존한다.
6. Design Pack 승인은 최신 `submitted` Job과 `claude.ai` 결과 URL을 요구한다.
7. 최종 export는 저장소에 직접 쓰지 않고 경로와 Markdown 콘텐츠를 가진 portable JSON bundle로 반환한다. CLI/Git Connector가 같은 bundle을 파일로 materialize할 수 있다.

## 결과

- 디자인 제작이 단순 링크 입력이 아니라 재시도 가능한 운영 command가 된다.
- prompt snapshot과 결과 URL이 연결되어 변경 추적성이 생긴다.
- Core는 외부 인증에 종속되지 않으며 자동 Connector를 교체 가능하게 유지한다.
- 승인 산출물을 다른 저장소, Git Connector, 문서 시스템으로 옮길 수 있다.
