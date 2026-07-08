# Goodz — Agent Instructions

> [Hermes Agent](https://github.com/NousResearch/hermes-agent) · [Cursor](https://cursor.com) 등 코딩 에이전트가 이 모노레포에서 작업할 때 따르는 규칙입니다.

## 프로젝트 개요

**Goodz** — 굿즈 이커머스 풀스택 Turborepo (pnpm)  
**풀 프로세스:** 기획 → 디자인 → 개발 → QA → 배포 — [`PROJECT.md`](./PROJECT.md) · [`docs/00-process/WORKFLOW.md`](./docs/00-process/WORKFLOW.md)

| 경로 | 역할 | 포트 |
|------|------|------|
| `apps/api-server` | Express API | 4000 |
| `apps/web-shop` | Next.js 쇼핑몰 | 3000 |
| `apps/admin-dashboard` | Vite + React 어드민 | 5173 |
| `packages/types` | **SSOT** API 타입 (`Product` 등) | — |
| `packages/ui` | 공통 UI (`Button`) + Tailwind preset | — |
| `packages/tsconfig` | 공유 tsconfig | — |

## 절대 규칙

1. **패키지 매니저는 pnpm만** — 루트에서 `pnpm install`, `npm`/`yarn` 금지
2. **타입은 `@goodz/types`에 먼저** — 프론트·백엔드가 같은 인터페이스 공유
3. **UI는 `@goodz/ui`에 먼저** — 앱별 중복 Button/Input 금지
4. **작업 완료 전 검증** — 루트에서 `pnpm verify` (build + lint)
5. **Turbo 의존 순서** — `packages/*` 빌드 후 `apps/*` (`dependsOn: ^build`)

## 타입·API 워크플로우

새 도메인(예: Order, Cart) 추가 시 순서:

```text
packages/types/src/index.ts  →  apps/api-server  →  apps/web-shop / admin-dashboard
```

- API 응답은 반드시 `@goodz/types` 타입을 import해 사용
- mock 데이터는 `apps/api-server/src/data/`에 둠

## Tailwind / UI

- `packages/ui` 컴포넌트 추가 시 각 앱 `tailwind.config.ts`의 `content`에 `../../packages/ui/src/**` 포함 확인
- preset: `import goodzPreset from "@goodz/ui/tailwind.config"`

## 개발 서버

```bash
pnpm install
pnpm dev    # api + web-shop + admin 동시 (api 먼저 ^build)
```

- `web-shop`은 `dynamic = "force-dynamic"` — **api-server가 떠 있어야** 상품 목록 로드
- env: `NEXT_PUBLIC_API_URL` / `VITE_API_URL` = `http://localhost:4000`

## Hermes / Cursor / Claude Code 스킬 (단계별)

| Phase | 스킬 | 도구 |
|-------|------|------|
| P0 기획 | `skills/goodz-planning/SKILL.md` | Cursor |
| P1 디자인 | `skills/goodz-design/SKILL.md` | **Claude Design** + Claude Code `/design-sync` |
| P2 개발 | `skills/goodz-dev/SKILL.md` | Cursor / Claude Code |

```bash
ln -sf "$(pwd)/skills/goodz-planning" ~/.hermes/skills/goodz-planning
ln -sf "$(pwd)/skills/goodz-design" ~/.hermes/skills/goodz-design
ln -sf "$(pwd)/skills/goodz-dev" ~/.hermes/skills/goodz-dev
```

## 커밋

- Conventional Commits, **한국어** 메시지 (예: `feat: 장바구니 API 타입 추가`)
- 커밋 전 `pnpm verify`

## 다중 에이전트 협업 (동시 작업 규칙)

여러 에이전트(Cursor · Claude Code 등)가 **같은 체크아웃**을 동시에 쓰면 git 충돌·혼선이 발생합니다. 아래 역할을 지킵니다.

| 에이전트 | 역할 | git 권한 |
|----------|------|----------|
| **Cursor** | 코드 구현, 커밋·푸시, CI | ✅ `add`/`commit`/`push` 전담 |
| **Claude Code (Claude Design)** | `/design-sync`, 프로토타입, 디자인 산출물 생성 | ❌ git 건드리지 않음 (파일 생성만) |

- **git 작업은 Cursor가 단일 창구.** Claude Code가 만든 파일(`.design-sync/`, `packages/ui/tailwind*.{css,js}` 등)은 Cursor가 확인 후 커밋한다.
- 다른 세션이 만든 예상치 못한 변경/커밋을 발견하면, **먼저 동시 작업 여부를 의심**하고 파괴적 명령(reset·checkout·clean) 전에 사용자에게 확인한다.
- 장시간 병행이 필요하면 별도 worktree(`git worktree add`)로 물리적으로 분리한다.

## 금지

- `apps/*`에 API 타입 중복 정의
- `node_modules` 직접 수정
- turbo 캐시 무시하고 개별 앱만 수동 빌드 후 "완료" 보고
- 다른 에이전트 작업 중인 파일에 대해 확인 없이 `git reset`/`checkout`/`clean`
