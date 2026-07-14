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

### `GET /api/process/status`

**Response:** `ProcessStatus` (`@goodz/process`)

풀 프로세스 진행도 SSOT — `docs/00-process/status.json`을 로드합니다.

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

Delivery Metrics 추세용 snapshot — `docs/00-process/metrics-snapshots.json`을 로드합니다.

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

**Response:** `201` + `{ project: ProcessProject, run: ProcessRun }`

Template version의 Stage, Task와 Gate를 새 실행 인스턴스로 복제하고 첫 Stage를 시작합니다.

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

- `go`: 모든 Task가 완료되고 필수 Deliverable이 승인된 경우 현재 Stage를 완료하고 다음 Stage를 시작합니다.
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
