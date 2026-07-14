# Goodz — Agent Instructions

> Cursor · Claude Code · Hermes — **세션 시작 시 [NORTH_STAR.md](./docs/00-process/NORTH_STAR.md) 필독.**

## 프로젝트 목적 (가장 중요)

| | |
|---|---|
| **만드는 것** | **풀 프로세스 모노레포 시스템** — P0–P4 문서, Phase Gate, Turborepo 스캐폴드, CI, AI 스킬 |
| **만들지 않는 것** | 프로덕션 쇼핑몰 제품 |
| **데모** | `web-shop` · `admin` · `api-server` — 시스템이 잘 돌아감을 증명하는 레퍼런스 |

작업 절차: [docs/00-process/AGENT_GUIDE.md](./docs/00-process/AGENT_GUIDE.md)  
현재 상태: [PROJECT.md](./PROJECT.md)  
Claude Code 전용: [CLAUDE.md](./CLAUDE.md)

## 모노레포 구조 (데모)

| 경로 | 역할 | 포트 |
|------|------|------|
| `apps/api-server` | Express API | 4000 |
| `apps/web-shop` | Next.js 쇼핑몰 | 3000 |
| `apps/admin-dashboard` | Vite + React 어드민 | 5173 |
| `packages/process` | Goodz Core Process OS 타입 | — |
| `packages/types` | Goodz Commerce Reference 타입 | — |
| `packages/ui` | 공통 UI + Tailwind preset | — |

## 절대 규칙

1. **패키지 매니저는 pnpm만**
2. **플랫폼 타입은 `@goodz/process`, 커머스 예제 타입은 `@goodz/types`에 먼저**
3. **UI는 `@goodz/ui`에 먼저**
4. **작업 완료 전 `pnpm verify`**
5. **기능 변경 시 프로세스 문서 동반 갱신** (`API.md`, `screens/`, Gate 등)
6. **시스템 > 데모 기능** — 충돌 시 문서·게이트·CI 우선

## 타입·API 워크플로우

```text
packages/process → process route/data → process-dashboard
packages/types   → commerce route/data → web-shop / admin-dashboard
```

- mock: `apps/api-server/src/data/`
- API 명세: `docs/03-engineering/API.md`

## Phase별 스킬

| Phase | 스킬 | 도구 |
|-------|------|------|
| P0 | `skills/goodz-planning/` | Cursor |
| P1 | `skills/goodz-design/` | Claude Design + Claude Code |
| P2 | `skills/goodz-dev/` | Cursor |
| 시스템 | `skills/goodz-system/` | Cursor |

## 다중 에이전트

| 에이전트 | git |
|----------|-----|
| **Cursor** | ✅ add/commit/push 전담 |
| **Claude Code** | ❌ 산출물 생성만 |

## 커밋

- Conventional Commits, **한국어**
- 커밋 전 `pnpm verify`

## 금지

- 쇼핑몰 기능만 추가하고 문서·Gate 미갱신
- `apps/*`에 타입 중복 정의
- 에이전트 동시 git 조작
- Phase 건너뛰기
