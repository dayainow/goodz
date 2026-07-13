# 프로세스 모니터링 대시보드

> **Goodz 시스템 제품**의 진행도 SSOT를 시각화하는 4번째 앱

## 왜 필요한가

Goodz의 진짜 제품은 쇼핑몰이 아니라 **P0–P4 풀 프로세스 시스템**입니다.  
Phase Gate·Sprint·기획 입력·산출물·기능 백로그·개발 증거를 **한 화면에서 관리**해야 에이전트·PM이 상태를 공유할 수 있습니다.

## 아키텍처

```text
docs/00-process/status.json              ← SSOT (수동·에이전트 갱신)
docs/00-process/metrics-snapshots.json   ← Metrics trend snapshot
        │
        ▼ GET /api/process/status
        ▼ GET /api/process/metrics-snapshots
api-server (:4000)
        │
        ▼ fetch
process-dashboard (:5180)       ← 모니터링 UI
```

| 레이어 | 역할 |
|--------|------|
| `status.json` | Phase·Sprint·기획 입력·기획 변경·산출물·DACI 승인·추적 링크·기능·앱 목록의 기계 판독 가능 상태 |
| `metrics-snapshots.json` | Delivery Metrics 추세를 위한 저장 시점별 기준점 |
| `@goodz/types` | `ProcessStatus` 타입 SSOT |
| `api-server` | JSON 파일 로드·API 제공 |
| `process-dashboard` | 30초 폴링 · 사이드바 메뉴 · Intake/Change/Deliverable/DACI Approval/Evidence/Metrics/Trace/Phase/Queue/Feature/App 관리 뷰 |

## 접속

```bash
pnpm dev
# http://localhost:5180
```

API 단독 확인:

```bash
curl http://localhost:4000/api/process/status
curl http://localhost:4000/api/process/metrics-snapshots
```

## status.json 갱신 규칙

작업 완료 시 **함께 갱신**:

1. `docs/00-process/status.json` — 해당 항목 `status` · `progress`
2. `PHASE_GATES.md` / `PROJECT.md` / `ROADMAP.md` — 사람이 읽는 문서
3. 대시보드에서 반영 확인 (새로고침 또는 30초 대기)

### status 값

| 값 | 의미 |
|----|------|
| `done` | 완료 |
| `in_progress` | 진행 중 |
| `pending` | 미착수 |
| `blocked` | 차단됨 |

## UI 구성

- **개요** — Sprint 목표·전체 진행률·우선 처리 작업
- **기획** — 입력 요청·출처·다음 액션
- **변경** — 기획 수정 요청·대상 문서·반영 상태
- **산출물** — PRD·화면설계·API·QA·릴리스 문서 레지스트리
- **승인** — Driver·Approver·Contributors·Informed·승인 기준·결정 로그
- **증거** — Issue/PR/Commit/CI/승인/릴리즈·스모크 누락 경고
- **지표** — DORA 원형 지표, Goodz delivery health, snapshot trend, 요청→커밋→CI→증거 시간
- **추적** — 기획·변경·산출물·승인과 Issue/PR/Commit/CI/Release 증거 연결
- **Phase Gate** — P0–P4 패널 + 문서 경로
- **작업 큐** — 차단/진행/대기/완료 상태별 항목
- **기능** — F-01… 기능 백로그 테이블
- **앱** — 4앱 포트·역할·바로가기

## 관련 문서

- [NORTH_STAR.md](./NORTH_STAR.md)
- [PHASE_GATES.md](./PHASE_GATES.md)
- [APPROVALS.md](./APPROVALS.md)
- [DECISIONS.md](./DECISIONS.md)
- [TRACEABILITY.md](./TRACEABILITY.md)
- [GITHUB_TRACE_SYNC.md](./GITHUB_TRACE_SYNC.md)
- [METRICS.md](./METRICS.md)
- [CICD.md](./CICD.md)
- [deliverables/README.md](../deliverables/README.md)
- [PROJECT.md](../../PROJECT.md)
