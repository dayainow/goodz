# Goodz Operations Store

Goodz의 운영 저장소는 Markdown과 `status.json`을 대체하지 않는다. 문서 SSOT에서 파생되는 검색 인덱스와 반복적으로 갱신되는 운영 사건·프로젝트 실행 상태를 SQLite에 저장하는 실행 계층이다.

## 책임 경계

| 데이터 | 기준 저장소 | SQLite 역할 |
|---|---|---|
| Phase, 승인, 산출물, 추적 링크 | Git으로 버전 관리되는 문서와 `status.json` | 읽기 모델과 문서 인덱스 |
| 운영 사건 | SQLite | 생성·종료·MTTR 계산의 기준 저장소 |
| 기본 프로세스 템플릿 | `templates/process/*.json` | 시작 시 검증·seed |
| 사용자 프로세스 템플릿 | SQLite | Builder로 생성한 버전 고정 단계·작업·산출물 정의 |
| PRD/Design 초안 | SQLite | 질문형 입력, 승인 상태, 화면·스토리보드·Claude handoff 실행 상태 |
| 프로젝트 실행 | SQLite | Project, Run, Stage, Task, Deliverable, Evidence, Gate 상태의 기준 저장소 |
| 실행 감사 이력 | SQLite | command마다 append-only event 기록 |
| 문서 본문 | `docs/**/*.md` | 경로·제목·수정 시각 인덱스 |

## 로컬 실행

- 기본 파일: `data/goodz.db`
- 메모리 검증: `pnpm check:sqlite`
- 경로 변경: `GOODZ_DB_PATH=/path/to/goodz.db`
- 내구성 표기: `GOODZ_DB_DURABILITY=local|persistent`
- 외부 접근 보호: `GOODZ_BASIC_AUTH_USER`, `GOODZ_BASIC_AUTH_PASSWORD`

서버 시작 시 schema migration, P0–P4·Phase 0–8 Template seed와 문서 인덱스 동기화를 자동 수행한다. DB 파일과 WAL 파일은 Git에 포함하지 않는다.

## Schema v4 실행 규칙

- 프로젝트 생성 시 선택한 Template version을 독립적인 Process Run으로 복제한다.
- 첫 단계만 `in_progress`, 나머지는 `pending`으로 시작한다.
- 현재 Stage가 아닌 단계의 Task·Stage·Gate 변경은 거부한다.
- Task는 `pending`, `in_progress`, `blocked`, `done` 상태와 담당자를 가진다.
- Deliverable은 `pending`, `submitted`, `approved`, `changes_requested` 상태와 Owner·URI·메모를 가진다.
- Evidence는 문서·Issue·PR·Commit·CI·Release 링크를 현재 Stage에 append-only로 연결한다.
- GO는 현재 단계의 모든 Task가 `done`이고 모든 필수 Deliverable이 `approved`일 때만 가능하다.
- GO는 현재 단계를 닫고 다음 단계를 자동 시작한다. 마지막 Gate의 GO는 Run을 완료한다.
- HOLD는 Stage와 Run을 차단하고 KILL은 Run을 종료한다.
- 모든 command는 `process_audit_events`에 시간과 근거를 기록한다.
- 프로젝트 생성 시 빈 PRD Brief와 Design Pack을 함께 만든다.
- PRD 수정은 PRD와 downstream Design 승인을 `draft`로 되돌리고, Design 수정은 Design 승인만 되돌린다.
- Design Pack 승인은 승인된 PRD와 콘셉트·화면·스토리보드·Claude Design URL을 요구한다.

## 배포

`render.yaml`은 Process Dashboard 정적 빌드와 API를 하나의 Node 서비스로 배포한다. `/var/data`에 1GB 영구 디스크를 마운트하고 `GOODZ_DB_PATH=/var/data/goodz.db`를 사용한다.

영구 디스크 없이 실행하면 배포·재시작 때 SQLite 데이터가 사라질 수 있다. Render Blueprint의 `starter` 플랜과 disk 항목을 임의로 제거하지 않는다.

외부 배포에서는 두 Basic Auth 환경 변수를 모두 설정해야 한다. 하나만 설정되면 서버는 안전하게 503을 반환한다. 로컬 개발은 두 변수가 모두 없을 때 인증 없이 실행된다.

## 장애와 백업

1. `/health`와 `/api/process/operations`를 확인한다.
2. `storage.durability`가 `persistent`인지 확인한다.
3. 장애 시 마지막 green SHA로 애플리케이션을 롤백한다.
4. DB 복구가 필요하면 호스팅 제공자의 disk snapshot 또는 별도 백업본을 사용한다.

SQLite는 단일 인스턴스 운영에 적합하다. 다중 인스턴스·다중 writer가 필요해지는 시점에는 PostgreSQL 전환 ADR을 작성한다.
