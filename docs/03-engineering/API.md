# Goodz API 명세

Base URL: `http://localhost:4000` (개발)

## 타입 경계

| 컨텍스트 | 타입 SSOT | 주요 타입 |
|---|---|---|
| Goodz Core | `@goodz/process` | `ProcessStatus`, `ProcessWorkspaceOverview`, `ProcessRun`, `ProcessOperationsOverview` |
| Goodz Commerce Reference | `@goodz/types` | `Product`, `CartView`, `CheckoutResult` |

현재 두 컨텍스트는 같은 Express 런타임을 사용하지만 `routes/process.ts`와 `routes/commerce.ts`로 분리되어 있다.

비커머스 이식성 예제는 별도 런타임과 타입 계약을 사용한다. 명세: `references/internal-service/docs/API.md`.

## Endpoints

### `GET /health`

```json
{ "ok": true, "service": "goodz-api" }
```

### `GET /api/products`

**Response:** `ProductListResponse`

### `GET /api/products/:id`

**Response:** `Product`  
**404:** `{ "message": "Product not found" }`

### `POST /api/products`

**Body:** `CreateProductRequest`

```json
{
  "name": "굿즈 머그컵",
  "price": 19900,
  "description": "세라믹 머그컵 350ml",
  "imageUrl": "/images/mug.png",
  "category": "living",
  "stock": 40
}
```

**Response:** `201` + `Product` (id는 `gd-004` 형식으로 자동 생성)  
**400:** `{ "message": "..." }`

### `GET /api/cart`

**Query:** `cartId` 또는 헤더 `x-cart-id`

**Response:** `CartView`

### `POST /api/cart/items`

**Headers:** `x-cart-id` (선택 — 없으면 새 장바구니 생성)

**Body:**

```json
{ "productId": "gd-001", "quantity": 1 }
```

**Response:** `CartView`

### `POST /api/checkout`

**Body:**

```json
{ "cartId": "uuid" }
```

**Response:** `CheckoutResult`

```json
{
  "orderId": "ord-123",
  "total": 23800,
  "status": "paid",
  "items": []
}
```

### `GET /api/process/reference`

**Response:** `ProcessReferenceCapability` (`@goodz/process`)

현재 Workspace가 Goodz 내부 개발 Reference를 명시적으로 활성화했는지 반환합니다. 신규 `goodz init` Workspace는 `{ "available": false }`이며 사용자 프로젝트 기능은 이 상태에서도 정상 동작합니다.

### `GET /api/process/status`

**Response:** `ProcessStatus` (`@goodz/process`)

Goodz 제품 개발 저장소의 `platform.internalReference`가 활성화된 경우에만 `references/goodz-internal/status.json`을 로드합니다. 일반 사용자 Workspace에서는 `404`를 반환합니다.

**소비자:** `process-dashboard` (:5180)

**주요 필드**

| 필드 | 설명 |
|------|------|
| `sprint` | 현재 스프린트와 목표 |
| `phases` | P0–P4 Gate와 체크 항목 |
| `intakes` | 기획 입력함 항목 |
| `planningChanges` | 기획 수정 요청·승인·반영 로그 |
| `deliverables` | PRD·화면설계·API·QA·릴리스 산출물 레지스트리 |
| `approvals` | 스프린트·Gate·산출물의 DACI 승인 로그 |
| `traceLinks` | 기획·변경·산출물·승인과 Issue/PR/Commit/CI/Release/Smoke 증거 및 timestamp 연결 |
| `features` | 레퍼런스 기능 백로그 |
| `apps` | 로컬 앱·서비스 링크 |

### `GET /api/process/metrics-snapshots`

**Response:** `ProcessMetricSnapshotsFile` (`@goodz/process`)

Delivery Metrics 추세용 snapshot — `references/goodz-internal/metrics-snapshots.json`을 로드합니다.

**소비자:** `process-dashboard` (:5180) Metrics 메뉴

**주요 필드**

| 필드 | 설명 |
|------|------|
| `snapshots[].capturedAt` | snapshot 저장 시각 |
| `snapshots[].source` | 기준 systemVersion, status updatedAt, Git HEAD |
| `snapshots[].totals` | trace 수, linked/released 수, evidence issue 수 |
| `snapshots[].delivery` | lead time, CI success, change failure, smoke pass, trace coverage, evidence completeness |

### `GET /api/process/document`

**Query:** `path=docs/.../*.md`

**Response:** `ProcessDocumentResponse` (`@goodz/process`)

대시보드 안에서 Markdown 문서 원문을 확인하기 위한 읽기 전용 endpoint입니다. 보안상 `docs/` 아래 `.md` 파일만 읽습니다.

```json
{
  "path": "docs/00-process/USER_MANUAL.md",
  "title": "Goodz Process Dashboard 이용 매뉴얼",
  "content": "# Goodz Process Dashboard 이용 매뉴얼...",
  "updatedAt": "2026-07-13T02:30:00.000Z"
}
```

### `GET /api/process/operations`

**Response:** `ProcessOperationsOverview` (`@goodz/process`)

SQLite 저장 엔진·내구성·schema version, 문서 인덱스 수, incident/MTTR 요약과 최근 사건을 반환합니다.

### `GET /api/process/workspace`

**Response:** `ProcessWorkspaceOverview`

사용 가능한 Template, Project, Process Run과 최근 audit event를 반환합니다.

### `POST /api/process/templates`

**Body:** `CreateProcessTemplateRequest`

Stage code/name/summary, 1개 이상의 Task와 선택적 Deliverable 정의를 전달합니다. 검증된 Template은 SQLite Catalog에 저장되고 즉시 프로젝트 생성에 사용할 수 있습니다. 저장소 기본 Template은 `templates/process/*.json`에서 seed합니다.

Template 조회 응답의 각 Stage는 Visual Builder 복제를 위한 `code`를 포함합니다. 서버는 Stage code 중복·형식, 최대 20 Stage, Stage당 50 Task·20 Deliverable, 필수 필드와 길이 제한을 검증합니다.

### `POST /api/process/templates/:templateId/versions`

**Body:** `{ "name"?: string, "summary"?: string }`

기존 Template의 Stage·Task·Deliverable 정의를 변경하지 않고 다음 immutable version으로 복제합니다. 응답은 `{ source, target }`이며 기존 Process Run은 생성 당시 `templateId`와 `templateVersion`에 계속 고정됩니다. 새 프로젝트만 새 Template ID를 선택합니다.

### `POST /api/process/projects`

**Body:** `CreateProcessProjectRequest`

```json
{
  "name": "신규 B2B 포털",
  "summary": "파트너 주문 업무를 한 흐름으로 통합",
  "owner": "Platform Team",
  "templateId": "TPL-GOODZ-P0-P4-V1"
}
```

**Response:** `201` + `{ project: ProcessProject, run: ProcessRun, artifacts: ProcessArtifactWriteResult }`

Template version의 Stage, Task와 Gate를 새 실행 인스턴스로 복제하고 첫 Stage를 시작합니다.

프로젝트 생성 시 빈 `ProcessProjectBrief`와 `ProcessDesignPack`도 함께 생성합니다.
또한 Workspace `docs/projects/<project-id>/`에 README와 첫 Stage Markdown 스캐폴드를 씁니다(`GOODZ_DB_PATH=:memory:` 또는 `GOODZ_SKIP_ARTIFACT_WRITE=1`이면 디스크 쓰기를 건너뜁니다).

### `PATCH /api/process/projects/:projectId/brief`

**Body:** `UpdateProcessProjectBriefRequest`

문제, 사용자, 가치, MVP 범위, 비목표, 성공 지표와 제약을 저장하고 Markdown PRD projection을 반환합니다. 기존 승인은 Draft로 초기화됩니다.

### `POST /api/process/projects/:projectId/brief/approve`

모든 PRD 필드가 작성된 경우 Brief를 승인합니다. 빈 필드가 있으면 `400`을 반환합니다.

### `PATCH /api/process/projects/:projectId/design-pack`

**Body:** `UpdateProcessDesignPackRequest`

디자인 콘셉트, 화면 명세와 스토리보드를 저장합니다. 응답의 `handoffPrompt`는 현재 승인 PRD와 Design Pack을 합성합니다. 저장하면 열려 있는 Design Job은 `changes_requested`가 됩니다.

### `POST /api/process/projects/:projectId/design-jobs`

승인 PRD와 완성된 Design Pack을 snapshot으로 고정한 `manual_claude_design` 작업을 생성합니다.

### `POST /api/process/projects/:projectId/design-jobs/:jobId/start`

`queued` Job을 `in_progress`로 바꾸고 Claude Design 수동 제작 시작을 기록합니다.

### `POST /api/process/projects/:projectId/design-jobs/:jobId/submit`

**Body:** `{ "resultUrl": "https://claude.ai/design/...", "note": "검토 메모" }`

Claude Design 결과를 `submitted`로 기록하고 Design Pack 결과 URL projection을 갱신합니다.

### `POST /api/process/projects/:projectId/design-jobs/:jobId/changes`

**Body:** `{ "note": "수정할 내용" }`

검토 중인 결과를 `changes_requested`로 되돌립니다.

### `POST /api/process/projects/:projectId/design-pack/approve`

승인된 PRD, 완성된 콘셉트, 1개 이상의 화면·스토리보드와 최신 `submitted` Design Job이 있을 때 Design Pack과 Job을 함께 승인합니다.

### `GET /api/process/projects/:projectId/export`

승인된 PRD, Design Pack, Claude Design handoff prompt snapshot을 3개 Markdown 파일로 구성한 portable JSON bundle을 반환합니다.

`@goodz/cli`의 `goodz export`는 이 응답을 `docs/projects/<project-id>/`에 원자적으로 materialize하고 `.goodz/exports/` hash manifest로 로컬 수정 충돌을 보호합니다.

### `GET /api/process/projects/:projectId/book`

**Response:** `ProcessProjectBook`

현재(또는 최신) Process Run의 Stage·Task·산출물·Gate·감사 이력을 Project Book Markdown으로 합성합니다. 디스크 쓰기가 가능하면 `docs/projects/<project-id>/PROJECT_BOOK.md`에도 저장합니다.

### `PATCH /api/process/runs/:runId/stages/:stageId`

**Body:** `{ "status": "in_progress" | "blocked" }`

Stage와 Run 상태를 함께 갱신하고 audit event를 기록합니다.

### `PATCH /api/process/runs/:runId/stages/:stageId/tasks/:taskId`

**Body:** `UpdateProcessTaskRequest`

```json
{ "status": "done", "assignee": "PM" }
```

Task 상태와 담당자를 변경합니다. `blocked` Task는 Stage와 Run도 차단합니다.

### `PATCH /api/process/runs/:runId/stages/:stageId/deliverables/:deliverableId`

**Body:** `UpdateProcessDeliverableRequest`

```json
{
  "status": "approved",
  "owner": "PM",
  "uri": "docs/01-planning/PRD.md",
  "note": "범위와 성공 기준 승인"
}
```

산출물의 `pending | submitted | approved | changes_requested` 상태와 Owner, URI, 메모를 저장합니다. 제출 이후 상태에는 Owner와 URI가 필수입니다.

### `POST /api/process/runs/:runId/stages/:stageId/evidence`

**Body:** `CreateProcessEvidenceRequest`

```json
{
  "type": "ci",
  "label": "verify run",
  "url": "https://github.com/example/actions/runs/1",
  "summary": "build, lint, lifecycle 검증 통과"
}
```

현재 Stage에 `document | issue | pr | commit | ci | release | link` 증거를 append-only로 연결합니다.

### `POST /api/process/runs/:runId/stages/:stageId/gate-decisions`

**Body:** `DecideProcessGateRequest`

```json
{ "decision": "go", "note": "PRD와 성공 기준 승인" }
```

**Response:** `{ run: ProcessRun, artifacts: ProcessArtifactWriteResult }`

- `go`: 모든 Task가 완료되고 필수 Deliverable이 승인된 경우 현재 Stage를 완료하고 다음 Stage를 시작합니다. Stage Markdown을 기록하고 다음 Stage 스캐폴드(또는 최종 `PROJECT_BOOK.md`)를 씁니다.
- `hold`: 근거를 기록하고 현재 Run을 차단합니다.
- `kill`: 근거를 기록하고 현재 Run을 종료합니다.

### `GET /api/process/incidents`

**Response:** `ProcessIncident[]`

최근 운영 사건을 최신순으로 반환합니다.

### `POST /api/process/incidents`

**Body:** `CreateProcessIncidentRequest`

```json
{
  "title": "배포 smoke 실패",
  "summary": "Process Dashboard health check가 실패했습니다.",
  "severity": "high"
}
```

**Response:** `201` + `ProcessIncident`

### `PATCH /api/process/incidents/:id/resolve`

열린 사건을 종료하고 `resolvedAt`을 기록합니다.

**Response:** `ProcessIncident`
**404:** `{ "message": "Incident not found" }`

## SQLite 설정

| 변수 | 기본값 | 설명 |
|---|---|---|
| `GOODZ_DB_PATH` | `data/goodz.db` | DB 파일 경로. `:memory:`는 검증용 |
| `GOODZ_DB_DURABILITY` | 경로 기반 자동 판정 | `memory`, `local`, `persistent` 운영 표기 |
| `GOODZ_BASIC_AUTH_USER` | 없음 | 외부 Process OS 보호 계정 |
| `GOODZ_BASIC_AUTH_PASSWORD` | 없음 | 외부 Process OS 보호 비밀번호 |

API 시작 시 schema migration, 기본 P0–P4 Template seed와 `docs/**/*.md` 문서 인덱스 동기화를 수행합니다.
Basic Auth 값은 둘 다 있을 때 전체 서비스에 적용되고, 하나만 있으면 설정 오류로 503을 반환합니다.

## 변경 절차

1. 플랫폼 변경은 `packages/process`, 커머스 예제 변경은 `packages/types`에서 계약을 먼저 수정
2. 각각 `routes/process.ts` 또는 `routes/commerce.ts`와 data 모듈 구현
3. 해당 소비 앱 fetch 갱신
4. 이 문서 + PRD AC + 필요 시 ADR 동기화
5. `pnpm verify`로 컨텍스트 경계와 전체 빌드 확인
