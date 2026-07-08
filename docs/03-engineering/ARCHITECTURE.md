# Goodz 아키텍처

## 시스템 다이어그램

```text
                    ┌─────────────────┐
                    │  admin-dashboard │
                    │  Vite + React    │
                    └────────┬────────┘
                             │ fetch
┌──────────────┐             │             ┌──────────────┐
│   web-shop   │─────────────┼────────────│  api-server  │
│   Next.js    │             │             │   Express    │
└──────┬───────┘             │             └──────┬───────┘
       │                     │                    │
       └──────────┬──────────┴──────────┬─────────┘
                  │                     │
           ┌──────▼──────┐       ┌──────▼──────┐
           │ @goodz/types │       │  @goodz/ui  │
           │   (SSOT)     │       │  components │
           └─────────────┘       └─────────────┘
```

## 모노레포

- **pnpm workspace** (`node-linker=isolated`) — 유령 의존성 방지
- **Turborepo** — `dependsOn: ["^build"]` + 로컬/CI 캐시 (`.turbo/cache`)
- 검증: `pnpm verify` (workspace · deps · build · lint)

## 앱별 책임

| 앱 | 책임 |
|----|------|
| api-server | REST API, mock/DB (향후) |
| web-shop | SSR/CSR, SEO, 고객 UX |
| admin-dashboard | 내부 운영 UI |

## ADR

- [001 — Turborepo + pnpm 선택](./ADR/001-monorepo-turborepo.md)

## 보안 (향후)

- API 인증: JWT / session (P2)
- CORS: 개발은 `*`, 프로덕션은 도메인 제한
