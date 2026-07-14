# Goodz Operations Store

Goodz의 사용자 운영 저장소는 Project·PRD·Design Pack·Run·Task·Gate와 감사 이벤트의 실행 SSOT다. 승인 문서는 Git working tree로 materialize하며, Goodz 자체 `status.json`은 사용자 데이터가 아닌 선택적 내부 Reference다.

## 책임 경계

| 데이터 | 기준 저장소 | SQLite 역할 |
|---|---|---|
| 사용자 Phase, 승인, 산출물, 추적 링크 | 프로젝트별 SQLite | command와 감사 이력의 기준 저장소 |
| Goodz 자체 Sprint·IN·CR·TL | `references/goodz-internal/status.json` | 내부 개발 저장소에서만 선택적으로 조회 |
| 운영 사건 | SQLite | 생성·종료·MTTR 계산의 기준 저장소 |
| 기본 프로세스 템플릿 | `templates/process/*.json` | 시작 시 검증·seed |
| 사용자 프로세스 템플릿 | SQLite | Builder로 생성한 버전 고정 단계·작업·산출물 정의 |
| PRD/Design 초안·Job | SQLite | 질문형 입력, 승인 상태, 화면·스토리보드·prompt snapshot·Claude handoff 실행 상태 |
| 프로젝트 실행 | SQLite | Project, Run, Stage, Task, Deliverable, Evidence, Gate 상태의 기준 저장소 |
| 실행 감사 이력 | SQLite | command마다 append-only event 기록 |
| Materialized 문서 | Git working tree | CLI가 `docs/projects/`에 생성하고 `.goodz/exports` manifest로 무결성 검증 |
| 문서 본문 | `docs/**/*.md` | 경로·제목·수정 시각 인덱스 |

## 로컬 실행

- 신규 Workspace 기본 파일: `.goodz/data/goodz.db`
- Goodz 소스 저장소: `.goodz/workspace.json`이 기존 `data/goodz.db`를 명시해 내부 dogfooding 이력을 유지
- 메모리 검증: `pnpm check:sqlite`
- 경로 변경: `GOODZ_DB_PATH=/path/to/goodz.db`
- 대상 저장소 연결: `GOODZ_WORKSPACE_ROOT=/path/to/project`
- 별도 설정 파일: `GOODZ_CONFIG_PATH=/path/to/goodz.config.json` (선택)
- 내구성 표기: `GOODZ_DB_DURABILITY=local|persistent`
- 외부 접근 보호: `GOODZ_BASIC_AUTH_USER`, `GOODZ_BASIC_AUTH_PASSWORD`

서버 시작 시 `.goodz/workspace.json` 또는 `GOODZ_DB_PATH`에서 Workspace별 DB를 선택하고 schema migration, P0–P4·Phase 0–8 Template seed와 문서 인덱스 동기화를 수행한다. DB 파일과 WAL 파일은 Git에 포함하지 않는다.

Goodz 소스 checkout에서 다른 로컬 프로젝트를 시험할 때는 API만 대상 Workspace로 전환합니다.

```bash
GOODZ_WORKSPACE_ROOT=/path/to/project pnpm --filter @goodz/api-server dev
pnpm --filter @goodz/process-dashboard dev
```

대상 프로젝트에 `templates/process`가 없으면 API 런타임에 포함된 기본 Template을 사용합니다. Reference capability는 대상 `goodz.config.json`에 `platform.internalReference`가 있을 때만 활성화됩니다.

## Schema v5 실행 규칙

- 프로젝트 생성 시 선택한 Template version을 독립적인 Process Run으로 복제한다.
- Template migration은 원본을 수정하지 않고 다음 version을 만들며 기존 Run의 version은 유지한다.
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
- Design Job은 `queued`, `in_progress`, `submitted`, `changes_requested`, `approved` 상태와 prompt snapshot·결과 URL을 가진다.
- Design Pack 승인은 승인된 PRD와 콘셉트·화면·스토리보드, 최신 `submitted` Claude Design Job을 요구한다.
- 승인 후 export는 SQLite 원본을 변경하지 않고 Markdown 파일 3건이 포함된 portable bundle을 생성한다.
- API 서버는 저장소에 쓰지 않으며 `goodz export`가 사용자 로컬/CI 권한으로 bundle을 materialize한다.

## 배포

`render.yaml`은 Process Dashboard 정적 빌드와 API를 하나의 Node 서비스로 배포한다. `/var/data`에 1GB 영구 디스크를 마운트하고 `GOODZ_DB_PATH=/var/data/goodz.db`를 사용한다.

영구 디스크 없이 실행하면 배포·재시작 때 SQLite 데이터가 사라질 수 있다. Render Blueprint의 `starter` 플랜과 disk 항목을 임의로 제거하지 않는다.

비용 없는 외부 기능 검증은 별도 `render.free.yaml`을 사용한다. 무료 프리뷰는 `/tmp/goodz.db`와 `GOODZ_DB_DURABILITY=local`로 실행하며 외부 URL, Dashboard/API, schema migration과 Process command smoke만 검증한다. 절전·재시작·재배포 후 데이터 보존은 검증 범위가 아니며 운영 데이터 입력에 사용하지 않는다.

외부 배포에서는 두 Basic Auth 환경 변수를 모두 설정해야 한다. 하나만 설정되면 서버는 안전하게 503을 반환한다. 로컬 개발은 두 변수가 모두 없을 때 인증 없이 실행된다.

## 장애와 백업

1. `/health`와 `/api/process/operations`를 확인한다.
2. `storage.durability`가 `persistent`인지 확인한다.
3. 장애 시 마지막 green SHA로 애플리케이션을 롤백한다.
4. DB 복구가 필요하면 호스팅 제공자의 disk snapshot 또는 별도 백업본을 사용한다.

SQLite는 단일 인스턴스 운영에 적합하다. 다중 인스턴스·다중 writer가 필요해지는 시점에는 PostgreSQL 전환 ADR을 작성한다.
