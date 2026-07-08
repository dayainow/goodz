# Goodz × Claude Design (P1 디자인)

> **P1 공식 도구:** Claude Design + Claude Code (`/design-sync`)  
> Figma는 보조·선택 — [FIGMA.md](./FIGMA.md)

## 왜 Claude Design인가

| | Figma | Claude Design |
|---|-------|----------------|
| Goodz 코드와 동기화 | 수동 / MCP 한도 | **`/design-sync`** 로 `@goodz/ui` 반영 |
| 구현 handoff | 스크린샷·재작업 | **Claude Code**가 이어서 구현 |
| 구독 | Figma + MCP | **Claude Pro** (이미 사용 중) |
| 산출물 | `.fig` 파일 | 프로토타입 + **코드 round-trip** |

```text
goodz repo (@goodz/ui, Tailwind)
        │
        ▼ /design-sync
Claude Design  ── 프로토타입 4화면
        │
        ▼ handoff
Claude Code / Cursor  ── apps/web-shop 반영
```

---

## 접속

| 채널 | URL / 명령 |
|------|------------|
| 웹 | [claude.ai/design](https://claude.ai/design) |
| 데스크톱 | Claude 앱 사이드바 → Design |
| 터미널 | Claude Code + `claude-design` MCP |

**요구:** Claude Pro / Max / Team · Design 베타 활성화

---

## 1. Claude Code MCP 설정 (1회)

```bash
claude mcp add --scope user --transport http claude-design https://api.anthropic.com/v1/design/mcp
```

Claude Code 세션에서:

```text
/design-login
```

확인:

```bash
claude mcp list
# claude-design: https://api.anthropic.com/v1/design/mcp - Connected
```

---

## 2. Goodz 디자인 시스템 동기화

goodz 루트에서 Claude Code 실행:

```bash
cd /Users/dobedub/Documents/source/ax/goodz
claude
```

```text
/design-sync
```

동기화 대상 (자동 인식 목표):

| 경로 | 내용 |
|------|------|
| `packages/ui/src/` | Button, Card |
| `packages/ui/tailwind.config.ts` | Pretendard, spacing |
| `docs/02-design/DESIGN_SYSTEM.md` | 토큰 표 |
| `docs/02-design/DESIGN_BRIEF.md` | 브랜드 violet 톤 |

---

## 3. P1 화면 제작 (Claude Design)

프로젝트명 권장: **Goodz — Web Shop MVP**

| # | 화면 | 라우트 | 스펙 문서 |
|---|------|--------|-----------|
| 1 | 상품 목록 | `/` | [product-list.md](./screens/product-list.md) |
| 2 | 상품 상세 | `/products/[id]` | [product-detail.md](./screens/product-detail.md) |
| 3 | 장바구니 | `/cart` | [cart.md](./screens/cart.md) |
| 4 | 체크아웃 | `/checkout` | [checkout.md](./screens/checkout.md) |
| 5 | 결제 완료 | `/checkout/success` | checkout.md |

### 첫 프롬프트 예시 (claude.ai/design)

```text
Goodz 굿즈 쇼핑몰 MVP를 디자인해줘.
- 브랜드: 밝고 친근, violet(#7C3AED) 포인트
- 모바일 퍼스트 375px
- 화면: 상품 목록, 상품 상세, 장바구니, 체크아웃
- 컴포넌트: primary/secondary Button, Card (이미 코드에 있음)
- docs/02-design/DESIGN_BRIEF.md 톤 따르기
```

로컬 미리보기 참고: `pnpm dev` → http://localhost:3000

---

## 4. 구현 handoff (P1 → P2)

디자인 확정 후 Claude Code:

```text
/design
Goodz web-shop 체크아웃 화면을 apps/web-shop에 반영해줘.
@goodz/ui Button/Card 사용, pnpm verify 통과까지.
```

또는 Claude Design UI에서 **Send to Claude Code** 사용.

Cursor에서 이어갈 때:

- `docs/02-design/screens/*.md` + Claude Design 링크를 컨텍스트로 제공
- `skills/goodz-dev` 규칙 준수

---

## 5. 산출물 체크리스트 (P1 Gate)

- [ ] Claude Design 프로젝트 생성 · 링크 아래 등록
- [ ] `/design-sync` 로 goodz DS 반영
- [ ] 쇼핑몰 4화면 + 결제완료 프로토타입
- [ ] `DESIGN_SYSTEM.md` Claude Design ↔ 코드 매핑 갱신
- [ ] (선택) 어드민 상품 목록 와이어

## 프로젝트 링크

| 항목 | 값 |
|------|-----|
| 프로젝트명 | Goodz — Web Shop MVP |
| 디자인 URL | _claude.ai/design 프로젝트 생성 후 등록_ |
| projectId | `5c71eb8f-588d-4c5f-8720-ac761c87b03c` (Design System, `/design-sync` 연결됨) |
| 동기화 repo | https://github.com/dayainow/goodz |
| 로컬 경로 | `/Users/dobedub/Documents/source/ax/goodz` |

---

## Figma와 병행

- 기존 빈 Figma 파일: [FIGMA.md](./FIGMA.md) (보조·팀 공유용)
- **P1 Gate 기준은 Claude Design** 프로토타입 + 코드 sync

---

## 트러블슈팅

| 증상 | 해결 |
|------|------|
| Design 메뉴 안 보임 | Pro/Max 확인 · [claude.ai/design](https://claude.ai/design) 직접 접속 |
| `/design-login` 실패 | `claude mcp add` 재실행 · 브라우저 로그인 |
| DS 안 맞음 | goodz에서 `/design-sync` 재실행 |
| 구현 어긋남 | `localhost:3000` 실제 화면과 diff · `DESIGN_SYSTEM.md` 참고 |

---

## 관련 문서

- [DESIGN_BRIEF.md](./DESIGN_BRIEF.md)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- [WORKFLOW.md](../00-process/WORKFLOW.md) P1 섹션
- [PHASE_GATES.md](../00-process/PHASE_GATES.md)
