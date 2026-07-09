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

---

## 권한 모드 — 중간 확인 없이 진행하기

Claude Code가 파일 수정·MCP 호출마다 물어보는 것을 줄이는 방법.

### 1) 세션 중 빠른 전환 (추천)

프롬프트 하단 상태바에서 **Shift+Tab** 으로 모드 순환:

```text
default (매번 물어봄) → accept edits on → plan mode → …
```

**`accept edits on`** (`⏵⏵ accept edits on`) — 파일 편집·일반 파일시스템 명령은 **자동 승인**, 셸·위험 작업만 확인.

디자인 업로드처럼 반복 편집이 많을 때 이 모드가 적합합니다.

### 2) 기본 모드 고정 (매 세션 자동)

**사용자 설정** `~/.claude/settings.json` (프로젝트 파일보다 우선):

```json
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": [
      "mcp__claude-design__*"
    ]
  }
}
```

| 모드 | 설명 | 추천 |
|------|------|------|
| `acceptEdits` | 편집 자동 승인, 셸은 선택적 확인 | **Goodz 디자인 작업** |
| `auto` | 안전하다고 판단되는 도구 자동 승인 | 긴 작업·피로 감소 |
| `bypassPermissions` | 거의 모든 확인 스킵 | **격리 VM/컨테이너만** |

`auto` 기본값: `"defaultMode": "auto"` (계정 eligible 시, **user settings만**)

### 3) MCP·명령 미리 허용

프로젝트 로컬: `.claude/settings.local.json` — 이미 `mcp__claude-design__*` 등 allow 목록 있음.

특정 Bash 패턴 추가 예:

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm *)",
      "mcp__claude-design__write_files"
    ]
  }
}
```

### 4) 완전 스킵 (주의)

```bash
claude --dangerously-skip-permissions
```

또는 settings에 `"defaultMode": "bypassPermissions"`. **삭제·push 등도 묻지 않음** — 로컬 데모·디자인 전용 세션에서만.

### Goodz 권장 조합

```text
디자인 세션: Shift+Tab → accept edits on + settings.local.json MCP allow
handoff 코드: acceptEdits 또는 auto (git은 Cursor가 담당하므로 Claude는 commit 안 함)
```

공식 문서: https://code.claude.com/docs/en/permissions

---

## Claude Code에 작업 시키는 방법 (복붙용)

goodz 루트에서 `claude` 실행 → **Shift+Tab**으로 `accept edits on` 확인 후 아래 프롬프트 붙여넣기.

### 디자인 수정 (Claude Design)

```text
Goodz Claude Design 프로젝트를 수정해줘.
- 프로젝트: https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9
- 참고: docs/02-design/DESIGN_BRIEF.md, docs/02-design/screens/
- CTA violet #7C3AED, Sticky Lemon 파스텔 톤 유지
- git commit/push 하지 마 (CLAUDE.md 규칙)
- 완료 시 화면별 링크 표로 보고
```

### 코드 handoff (앱 반영 — Cursor 대신 Claude가 할 때)

```text
Goodz admin-dashboard에 Claude Design 어드민 UI를 반영해줘.
- 스펙: docs/02-design/screens/admin-product-list.md, admin-product-create.md
- 디자인 참고: admin-product-list.dc.html, admin-product-create.dc.html (위 프로젝트)
- 1280px 사이드바 + 테이블/폼, brand-violet CTA, 파스텔 카테고리 칩
- apps/admin-dashboard만 수정, @goodz/ui · @goodz/types 사용
- pnpm verify 통과까지
- git commit 하지 마 — 완료 보고만
```

### Cursor에게 시킬 때 (이 채팅)

```text
어드민 UI handoff 진행해줘 (1280px, 사이드바, 상품목록/등록)
```

역할 분리: **디자인 산출물 = Claude Code** · **git·문서·코드 커밋 = Cursor**
