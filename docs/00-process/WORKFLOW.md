# Goodz 풀 프로세스 워크플로우

> **전제:** Goodz의 제품은 쇼핑몰이 아니라 이 워크플로우 + 모노레포 + 게이트로 구성된 **시스템**입니다.  
> [NORTH_STAR.md](./NORTH_STAR.md) · [AGENT_GUIDE.md](./AGENT_GUIDE.md)

실제 제품팀이 쓰는 **기획 → 디자인 → 개발 → QA → 배포** 흐름을 Goodz에 맞게 정의합니다.

## Dashboard 실행 루프

v0.22부터 P0–P4와 확장 Phase 0–8 정의는 `templates/process/`의 실행 가능한 Template로 제공됩니다.

프로젝트 운영 순서는 `Template 선택 → Task 완료 → 필수 산출물 제출·승인 → 증거 연결 → GO/HOLD/KILL`입니다. GO는 Task와 필수 산출물 조건을 모두 충족해야 다음 Stage를 시작합니다.

P0에서는 Project Workbench의 PRD Wizard로 초안을 작성·승인합니다. P1에서는 승인 PRD를 바탕으로 화면·스토리보드·콘셉트를 정리하고 Design Job의 prompt snapshot을 Claude Design에 전달합니다. 결과 제출·수정 요청·승인을 마친 뒤 `goodz export`가 portable bundle을 Git-ready Markdown으로 materialize해 개발 handoff에 연결합니다.

1. **프로젝트** 메뉴에서 이름, 목표, Owner와 Template을 선택합니다.
2. 현재 Stage의 Task 상태와 담당자를 갱신합니다.
3. 모든 필수 Task를 완료한 뒤 Gate 근거를 입력합니다.
4. GO는 다음 Stage를 시작하고, HOLD는 차단하며, KILL은 Run을 종료합니다.
5. 실행 command는 SQLite에, 장문 산출물과 외부 증거는 Git/GitHub에 남깁니다.

Dashboard의 Process Run은 이 문서의 운영 실행 상태이며, `status.json`은 Goodz 자체 개발 현황과 기존 Trace projection으로 유지합니다.

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
