# 에이전트 작업 가이드

> Cursor · Claude Code · Hermes가 Goodz에서 일할 때의 **표준 절차**.  
> 선행 필독: [NORTH_STAR.md](./NORTH_STAR.md)

---

## 0. 이 저장소에서 우리가 만드는 것

- **만드는 것:** 풀 프로세스 모노레포 **시스템** (문서 + 게이트 + 스캐폴드 + CI + AI 스킬)
- **만들지 않는 것:** 프로덕션 쇼핑몰 제품 (결제 PG, 회원, 대규모 카탈로그 등)

쇼핑몰 코드는 **시스템 데모**입니다. 기능 PR도 “시스템에 무엇을 보여주는가?”를 한 줄로 적습니다.

---

## 1. 세션 시작 (5분)

```text
① NORTH_STAR.md — 목적 확인
② PROJECT.md — 현재 Sprint / Phase
③ PHASE_GATES.md — 이 Phase 통과 조건
④ 본인 역할에 맞는 skills/goodz-*/SKILL.md
```

---

## 2. 작업 유형별 흐름

### A. 시스템·프로세스 강화 (최우선)

예: CI 개선, Gate 문서, 스킬 추가, 온보딩 가이드, verify 스크립트

```text
문서/설정 수정 → pnpm verify (해당 시) → ROADMAP/PROJECT 반영 → PR
```

### B. P0 기획

```text
PRD / USER_STORIES / GA4 → Issue → PHASE_GATES P0 체크
```

스킬: `skills/goodz-planning/`

### C. P1 디자인

```text
/design-sync → Claude Design 프로토타입 → screens/*.md → DESIGN_SYSTEM 매핑
```

- **Claude Code:** 프로토타입·sync 파일 생성만 — **git 금지**
- **Cursor:** 문서 등록·커밋

스킬: `skills/goodz-design/`

### D. P2 개발 (레퍼런스 앱)

```text
플랫폼: @goodz/process → process route/data → process-dashboard
설치/산출물: @goodz/cli → Process API bundle → docs/projects + hash manifest → 제한된 Git publish
커머스 예제: @goodz/types → commerce route/data → web-shop/admin-dashboard
공통 UI: @goodz/ui → apps → API.md → pnpm verify
```

스킬: `skills/goodz-dev/`

**데모 기능 추가 시 필수 동반 산출물:**

| 함께 갱신 | 이유 |
|-----------|------|
| `docs/03-engineering/API.md` | API SSOT와 플랫폼/Reference 경계 |
| `docs/01-planning/USER_STORIES.md` AC | 인수조건 추적 |
| `docs/02-design/screens/*.md` (UI 변경 시) | 디자인–코드 정합 |
| `PHASE_GATES` / `ROADMAP` (마일스톤 시) | 시스템 성숙도 |

### E. P3 QA

```text
TEST_PLAN 시나리오 실행 → GA compliance → RELEASE_CHECKLIST
```

---

## 3. 다중 에이전트 규칙

| 에이전트 | 담당 | git |
|----------|------|-----|
| **Cursor** | 코드, 문서, 커밋, CI | ✅ 전담 |
| **Claude Code** | Claude Design, `/design-sync` 산출물 | ❌ 금지 |

예상치 못한 git 변경 → 동시 작업 의심 → 사용자 확인 후 진행.

---

## 4. 완료 보고 템플릿

에이전트는 사용자에게 보고할 때 아래를 포함합니다:

```markdown
## 완료
- (변경 요약)

## 시스템 관점
- Phase: P?
- 강화한 시스템 요소: (예: P2 타입 SSOT 패턴, CI 캐시, P1 handoff 문서)
- 갱신한 문서: (경로 목록)

## 검증
- pnpm verify: pass/fail
- 수동 확인: (해당 시)

## 다음 Gate
- (남은 체크리스트 1–2개)
```

---

## 5. 범위 판단 (자주 묻는 것)

| 요청 | 권장 |
|------|------|
| “결제 PG 연동” | ❌ 비목표 — PRD 비목표에 명시, 거절 또는 P4+ 백로그 |
| “어드민 mock API” | ✅ 데모 + API.md + types SSOT 패턴 — 시스템에 유리 |
| “Claude Design 12화면” | ✅ P1 파이프라인 증명 — `screens/`·`CLAUDE_DESIGN.md` 필수 |
| “쇼핑몰 UI만 예쁘게” | 🟡 디자인 handoff 문서 없으면 보류 |
| “README 프로세스 강조” | ✅ 시스템 제품화 — 최우선 |

---

## 6. 커밋·PR

- Conventional Commits, **한국어**
- PR 본문: Phase 체크리스트 + `Closes #N`
- 커밋 전 `pnpm verify` (코드 변경 시)

---

## 7. 도구별 진입점

| 도구 | 읽을 파일 |
|------|-----------|
| **Cursor** | `AGENTS.md`, `.cursor/rules/`, `skills/goodz-dev/` |
| **Claude Code** | `CLAUDE.md`, `skills/goodz-design/` |
| **Hermes** | `AGENTS.md`, `docs/HERMES.md`, skills symlink |

---

## 8. 상위 문서

- [NORTH_STAR.md](./NORTH_STAR.md)
- [WORKFLOW.md](./WORKFLOW.md)
- [PHASE_GATES.md](./PHASE_GATES.md)
- [PROJECT.md](../../PROJECT.md)
