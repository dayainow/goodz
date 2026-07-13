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
│   Next.js    │             │             │Express+SQLite│
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
| api-server | REST API, 문서 SSOT 읽기, SQLite 운영 저장소, Process Dashboard 정적 제공 |
| web-shop | SSR/CSR, SEO, 고객 UX |
| admin-dashboard | 내부 운영 UI |
| process-dashboard | Phase·승인·추적·운영 사건 관리 UI |

## Process OS 데이터 흐름

```text
docs/**/*.md + status.json ──read/seed──> api-server ──same origin──> process-dashboard
                                           │
                                           └── SQLite: document_index + incidents
```

- Phase, 산출물, 승인, 추적 링크의 SSOT는 Git 기반 문서다.
- SQLite는 문서 인덱스와 운영 사건처럼 실행 중 자주 바뀌는 데이터만 담당한다.
- 배포에서는 API가 Process Dashboard 정적 파일을 함께 제공하며 `/var/data/goodz.db`를 영구 디스크에 저장한다.

## ADR

- [001 — Turborepo + pnpm 선택](./ADR/001-monorepo-turborepo.md)
- [002 — SQLite 운영 저장소](./ADR/002-sqlite-operations-store.md)

## 보안 (향후)

- API 인증: JWT / session (P2)
- CORS: 개발은 `*`, 프로덕션은 도메인 제한
