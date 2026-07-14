# Goodz 풀 프로세스 워크플로우

> **전제:** Goodz의 제품은 쇼핑몰이 아니라 이 워크플로우 + 모노레포 + 게이트로 구성된 **시스템**입니다.  
> [NORTH_STAR.md](./NORTH_STAR.md) · [AGENT_GUIDE.md](./AGENT_GUIDE.md)

실제 제품팀이 쓰는 **기획 → 디자인 → 개발 → QA → 배포** 흐름을 Goodz에 맞게 정의합니다.

## 역할

| 역할 | 담당 산출물 | 도구 |
|------|-------------|------|
| PM / 기획 | PRD, 유저스토리, GA4 명세 | Notion, `docs/01-planning/` |
| 디자이너 | Claude Design 프로토타입, 디자인시스템, 화면 스펙 | Claude Design, Claude Code, `docs/02-design/` |
| FE / BE | 코드, API, ADR | Cursor, Hermes, 모노레포 |
| QA | 테스트 플랜, 체크리스트 | `pnpm verify`, GA harness |
| DevOps | CI, 배포 | GitHub Actions |

## Phase 상세

### P0 — 기획

1. `docs/01-planning/PRD.md` 작성·갱신
2. 유저스토리 → GitHub Issue (`01-planning` 템플릿)
3. GA4 이벤트 표 → Notion export → (선택) `ga-analytics-harness` 연동
4. **Gate:** PRD 승인 + P1 착수 이슈 생성

### P1 — 디자인 (Claude Design)

1. Claude Code: `claude-design` MCP + `/design-login` ([CLAUDE_DESIGN.md](../02-design/CLAUDE_DESIGN.md))
2. `/design-sync` — goodz repo → Claude Design DS
3. [claude.ai/design](https://claude.ai/design) — 4화면 프로토타입
4. `docs/02-design/screens/` 스펙 정합성 · `DESIGN_SYSTEM.md` 갱신
5. **Gate:** 핵심 퍼널 프로토타입 + handoff 준비

> Figma는 보조 — [FIGMA.md](../02-design/FIGMA.md)

### P2 — 개발

1. 플랫폼은 `@goodz/process`, Commerce Reference는 `@goodz/types`에서 타입 먼저
2. `api-server` → `web-shop` / `admin-dashboard`
3. PR + `pnpm verify` 필수
4. **Gate:** AC(인수조건) 충족 + CI green

### P3 — QA

1. `docs/04-qa/TEST_PLAN.md` 시나리오 실행
2. GA compliance (이벤트 명세 ↔ 코드)
3. **Gate:** 릴리스 체크리스트 P0 항목 전부

### P4 — 배포

1. 스테이징 검증
2. 프로덕션 배포 + 모니터링
3. 회고 → ADR/문서 갱신

## AI 에이전트 사용법

| 단계 | Cursor | Hermes |
|------|--------|--------|
| 기획 | Notion MCP, PRD 초안 | `goodz-planning` 스킬 |
| 디자인 | Claude Design + `/design-sync` | `goodz-design` 스킬 |
| 개발 | `.cursor/rules` | `goodz-dev` + `pnpm verify` |
| QA | 테스트 실행 | cron으로 nightly verify |

## 브랜치 전략 (권장)

```text
main          ← 프로덕션
develop       ← 통합
feature/*     ← 기능
design/*      ← 디자인 토큰·스펙 동기화
docs/*        ← 기획·문서 only
```

## 이슈 → PR 연결

```text
Issue (기획/기능) → branch → PR (템플릿) → CI → 리뷰 → merge
```

PR 본문에 `Closes #이슈번호` 필수.
