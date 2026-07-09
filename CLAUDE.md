# Goodz — Claude Code Instructions

> Claude Code 세션에서 이 저장소를 다룰 때 **먼저 읽을 파일**.

## 이 프로젝트의 목적 (필수 이해)

**Goodz ≠ 쇼핑몰 제품.**

우리가 만드는 것은 **풀 프로세스 모노레포 시스템**입니다:

- P0–P4 문서·Phase Gate
- Turborepo + pnpm + `@goodz/types` SSOT
- CI (`pnpm verify`) + 에이전트 스킬

`apps/web-shop` · `admin` · `api-server`는 **시스템을 보여주는 데모**입니다.

👉 상세: `docs/00-process/NORTH_STAR.md`  
👉 작업 절차: `docs/00-process/AGENT_GUIDE.md`  
👉 현재 상태: `PROJECT.md`

---

## Claude Code 역할

| ✅ 담당 | ❌ 하지 말 것 |
|---------|----------------|
| `/design-sync` | `git add` / `commit` / `push` |
| Claude Design 프로토타입 | Phase Gate·ROADMAP 무시한 대규모 리팩터 |
| `.design-sync/`, 디자인 관련 파일 **생성** | Cursor가 커밋할 파일을 임의로 커밋 |

**git은 Cursor가 전담.** 산출물만 만들고 URL·화면 링크를 사용자에게 보고.

---

## 디자인 작업 시

1. `skills/goodz-design/SKILL.md` 참고
2. `docs/02-design/DESIGN_BRIEF.md` · `screens/` 스펙 준수
3. 완료 시 **프로젝트 URL + 화면별 링크 표** 제공
4. 시스템 관점: P1 Gate 산출물인지 `PHASE_GATES.md`와 대조

---

## 코드 작업 시 (handoff)

1. `skills/goodz-dev/SKILL.md` — types → api → apps 순서
2. `pnpm verify` 통과까지 (Cursor에 인계 가능)
3. API 변경 시 `docs/03-engineering/API.md` 갱신 필요함을 **보고** (Claude Code가 문서 수정해도 되나 git commit은 Cursor)

---

## 세션 시작 체크리스트

```text
[ ] NORTH_STAR.md 읽음
[ ] PROJECT.md 현재 Phase 확인
[ ] git 건드리지 않겠다고 인지
[ ] 이번 작업이 시스템(P?) 어느 부분을 강화하는지 명확
```

---

## 모노레포 빠른 참조

```bash
pnpm install
pnpm dev      # :4000 api, :3000 shop, :5173 admin
pnpm verify   # PR 전 필수
```

- 타입 SSOT: `packages/types`
- UI 공유: `packages/ui`

전체 규칙: `AGENTS.md`
