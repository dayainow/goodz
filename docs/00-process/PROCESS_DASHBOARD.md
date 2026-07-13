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
        ▼ GET /api/process/document?path=...
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
| `process-dashboard` | 30초 폴링 · 그룹형 사이드바 · 운영 브리핑 Overview · Guide/Intake/Change/Deliverable/DACI Approval/Evidence/Metrics/Trace/Phase/Queue/Feature/App 관리 뷰 |

## 접속

```bash
pnpm dev
# http://localhost:5180
```

API 단독 확인:

```bash
curl http://localhost:4000/api/process/status
curl http://localhost:4000/api/process/metrics-snapshots
curl "http://localhost:4000/api/process/document?path=docs/00-process/USER_MANUAL.md"
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

- **개요** — Sprint 목표·오늘 볼 신호·권장 액션·P0-P4 운영 지도·우선 처리 작업
- **기획** — 입력 요청·출처·다음 액션
- **변경** — 기획 수정 요청·대상 문서·반영 상태
- **가이드** — 서비스 이용 매뉴얼, 에이전트 가이드, 워크플로우, Metrics, CI/CD 문서 원문
- **산출물** — PRD·화면설계·API·QA·릴리스 문서 레지스트리
- **승인** — Driver·Approver·Contributors·Informed·승인 기준·결정 로그
- **증거** — Issue/PR/Commit/CI/승인/릴리즈·스모크 누락 경고
- **지표** — DORA 원형 지표, Goodz delivery health, snapshot trend, 요청→커밋→CI→증거 시간
- **추적** — 기획·변경·산출물·승인과 Issue/PR/Commit/CI/Release 증거 연결
- **Phase Gate** — P0–P4 패널 + 문서 경로
- **작업 큐** — 차단/진행/대기/완료 상태별 항목
- **기능** — F-01… 기능 백로그 테이블
- **앱** — 4앱 포트·역할·바로가기

## 사이드바 정보 구조

메뉴가 많아졌기 때문에 v0.11부터 기능 목록을 단순 나열하지 않고 업무 흐름별로 묶습니다.

| 그룹 | 메뉴 | 의도 |
|------|------|------|
| Start | 개요, 가이드 | 새 사용자와 운영자가 처음 볼 화면 |
| Plan | 기획, 변경, 산출물 | 요청과 문서 SSOT 확인 |
| Control | 승인, 증거, 지표, 추적 | 운영 통제와 품질 신호 확인 |
| System | Phase Gate, 작업 큐, 기능, 앱 | 실행 상태와 서비스 링크 확인 |

## Overview UX 기준

- 숫자 카드보다 먼저 `Start here`, `Next signal`, `Health` 액션을 제시합니다.
- evidence issue가 있으면 증거 메뉴로 자연스럽게 이동할 수 있어야 합니다.
- P0-P4 진행 상태는 개요에서 바로 볼 수 있어야 합니다.
- 기존 status, trace, metrics 데이터 모델은 유지하고 화면 구성만 더 운영자 친화적으로 만듭니다.

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
