# ADR-004 — Writable Process Control Plane

| 항목 | 내용 |
|---|---|
| 상태 | Accepted |
| 일자 | 2026-07-14 |
| 범위 | Goodz Core v0.21 |

## 배경

Process Dashboard는 Git 문서와 `status.json`을 읽는 운영 projection으로 시작했다. Incident만 SQLite에 기록할 수 있어 프로젝트 생성, 단계 시작, 작업 상태 변경과 Gate 결정은 Dashboard에서 수행할 수 없었다.

Goodz가 Process Control Plane이 되려면 문서 원문을 보존하면서도 반복적으로 바뀌는 실행 상태를 트랜잭션과 감사 이력으로 관리해야 한다.

## 결정

1. 프로세스 정의는 버전이 있는 `ProcessTemplate`로 관리한다.
2. 프로젝트 생성 시 템플릿을 `ProcessRun`, `StageRun`, `TaskRun`, `GateRun`으로 복제한다.
3. 실행 상태와 Gate 결정은 SQLite를 기준 저장소로 사용한다.
4. Markdown, 기존 승인·산출물·Trace 문서는 Git SSOT를 유지한다.
5. Dashboard는 실행 상태를 직접 조작하지 않고 Process API에 command를 보낸다.
6. 모든 프로젝트, 작업, 단계와 Gate 변경은 append-only audit event를 남긴다.
7. GO는 단계 작업이 모두 완료된 경우에만 허용하고 다음 단계를 자동 시작한다.
8. HOLD는 실행을 차단하고 KILL은 실행을 종료한다.
9. 현재 Stage가 아닌 단계의 Task·Stage·Gate command는 거부해 Phase 건너뛰기를 막는다.

## 결과

- 로컬·단일 인스턴스 Core는 SQLite로 설치 부담을 낮춘다.
- Cloud의 다중 사용자·다중 writer 전환 시 동일 계약을 PostgreSQL과 Worker로 옮길 수 있다.
- `status.json`은 기존 시스템 진행도와 증거 projection으로 유지되며 사용자 프로젝트 실행 상태의 원본이 아니다.
- Phase 0–8 같은 다른 프로세스는 Core 코드가 아니라 새 Template version으로 추가할 수 있다.

## 후속 작업

- Template Builder와 사용자 정의 Template 발행
- Deliverable/Evidence command와 Gate 정책식
- 인증·RBAC와 조직 단위 감사 로그
- PostgreSQL/Worker/GitHub Connector
