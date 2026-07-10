# 프로세스 모니터링 대시보드

> **Goodz 시스템 제품**의 진행도 SSOT를 시각화하는 4번째 앱

## 왜 필요한가

Goodz의 진짜 제품은 쇼핑몰이 아니라 **P0–P4 풀 프로세스 시스템**입니다.  
Phase Gate·Sprint·기능 백로그를 **한 화면에서 모니터링**해야 에이전트·PM이 상태를 공유할 수 있습니다.

## 아키텍처

```text
docs/00-process/status.json     ← SSOT (수동·에이전트 갱신)
        │
        ▼ GET /api/process/status
api-server (:4000)
        │
        ▼ fetch
process-dashboard (:5180)       ← 모니터링 UI
```

| 레이어 | 역할 |
|--------|------|
| `status.json` | Phase·Sprint·기능·앱 목록의 기계 판독 가능 상태 |
| `@goodz/types` | `ProcessStatus` 타입 SSOT |
| `api-server` | JSON 파일 로드·API 제공 |
| `process-dashboard` | 30초 폴링 · Phase 패널 · 앱 링크 |

## 접속

```bash
pnpm dev
# http://localhost:5180
```

API 단독 확인:

```bash
curl http://localhost:4000/api/process/status
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

- **Sprint 배너** — 현재 S2 목표·전체 진행률
- **Phase Gate** — P0–P4 패널 + 체크리스트
- **기능 백로그** — F-01…
- **앱 링크** — 4앱 포트·역할

## 관련 문서

- [NORTH_STAR.md](./NORTH_STAR.md)
- [PHASE_GATES.md](./PHASE_GATES.md)
- [PROJECT.md](../../PROJECT.md)
