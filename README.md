# Goodz — 굿즈 이커머스 풀스택 모노레포

Turborepo + pnpm 기반 이커머스 모노레포.  
**기획 → 디자인 → 개발 → QA → 배포** 전 과정을 회사 산출물 형식으로 관리합니다.

👉 **[PROJECT.md](./PROJECT.md)** — Phase 상태 · 워크플로우 허브

## 구조

```text
goodz/
├── PROJECT.md             # Phase 상태 · 링크 허브
├── docs/
│   ├── 00-process/        # 워크플로우 · Phase Gate
│   ├── 01-planning/       # PRD · 유저스토리 · GA4
│   ├── 02-design/         # Figma · 디자인시스템 · 화면 스펙
│   ├── 03-engineering/    # 아키텍처 · API · ADR
│   └── 04-qa/             # 테스트 · 릴리스
├── skills/                # Hermes/Cursor 단계별 스킬
├── apps/                  # web-shop · admin · api-server
└── packages/              # types · ui · tsconfig
```

## 시작하기

```bash
pnpm install
pnpm build
pnpm dev      # API :4000 · Shop :3000 · Admin :5173
pnpm verify   # build + lint (PR 전 필수)
```

## 풀 프로세스

| Phase | 산출물 |
|-------|--------|
| P0 기획 | [PRD](./docs/01-planning/PRD.md) · Issues |
| P1 디자인 | [Figma](./docs/02-design/FIGMA.md) · [DS](./docs/02-design/DESIGN_SYSTEM.md) |
| P2 개발 | 모노레포 · `@goodz/types` SSOT |
| P3 QA | [TEST_PLAN](./docs/04-qa/TEST_PLAN.md) |
| P4 배포 | CI · [RELEASE](./docs/04-qa/RELEASE_CHECKLIST.md) |

상세: [docs/00-process/WORKFLOW.md](./docs/00-process/WORKFLOW.md)

## Hermes Agent

[hermes-agent.org/ko](https://hermes-agent.org/ko/) · [docs/HERMES.md](./docs/HERMES.md)

## GitHub

- 이슈: 기획 / 기능 / 버그 템플릿
- PR: Phase 체크리스트 + `pnpm verify`
- CI: `.github/workflows/ci.yml`

## 환경 변수

- `apps/web-shop/.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:4000`
- `apps/admin-dashboard/.env` — `VITE_API_URL=http://localhost:4000`
