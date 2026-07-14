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
Claude Design  ── 프로토타입 12화면
        │
        ▼ handoff
Claude Code / Cursor  ── apps/web-shop · admin 반영
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

## 3. P1 화면 (12화면 완료 — 2026-07-09)

**프로젝트:** [Goodz — Web Shop MVP](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9)

**레퍼런스:** [Sticky Lemon](https://www.stickylemon.nl/) — 파스텔 카테고리 톤, NEW IN, 넉넉한 여백  
**브랜드 CTA:** violet `#7C3AED` 유지

전체 인덱스: [screens/README.md](./screens/README.md)

### 쇼핑몰 (375px)

| # | 화면 | 라우트 | Claude Design |
|---|------|--------|---------------|
| 1 | Home | `/` | [home.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=home.dc.html) |
| 2 | Shop | `/shop` | [shop.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=shop.dc.html) |
| 3 | Category | `/shop/accessory` | [category-accessory.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=category-accessory.dc.html) |
| 4 | Product Detail | `/products/[id]` | [product-detail.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=product-detail.dc.html) |
| 5 | Cart | `/cart` | [cart.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=cart.dc.html) |
| 6 | Cart Empty | `/cart` (empty) | [cart-empty.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=cart-empty.dc.html) |
| 7 | Checkout | `/checkout` | [checkout.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=checkout.dc.html) |
| 8 | Order Success | `/checkout/success` | [order-success.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=order-success.dc.html) |
| 9 | Search | `/search` | [search.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=search.dc.html) |
| 10 | About | `/about` | [about.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=about.dc.html) |

### 어드민 (1280px)

| # | 화면 | Claude Design |
|---|------|---------------|
| A1 | 상품 목록 | [admin-product-list.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=admin-product-list.dc.html) |
| A2 | 상품 등록 | [admin-product-create.dc.html](https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9?file=admin-product-create.dc.html) |

### 디자인 결정 (Sticky Lemon × Goodz)

| 항목 | 내용 |
|------|------|
| 카테고리 색 | 문구=파스텔 옐로우, 액세서리=핑크, 리빙=민트/피치 |
| 홈 구성 | NEW IN 그리드, 카테고리 일러스트 카드, 뉴스레터 mock 푸터 |
| 카탈로그 | 상품 8종 (검색·카테고리·샵에서 공유) |
| 네비 | 화면 간 실제 링크 (홈→쇼핑→상세→장바구니→체크아웃→완료) |
| 공통 CSS | `shop.css` (모바일), `admin.css` (데스크톱) |

로컬 미리보기 참고: `pnpm dev` → http://localhost:3000

---

## 4. 구현 handoff (P1 → P2)

### Process Dashboard Design Job

신규 프로젝트는 문서에 URL을 바로 입력하지 않고 Process Dashboard에서 다음 순서로 관리합니다.

1. 승인 PRD를 기반으로 Design Pack을 저장합니다.
2. `Handoff 작업 생성`으로 prompt snapshot을 고정합니다.
3. `작업 시작` 후 prompt를 Claude Design에 전달합니다.
4. 완성된 `https://claude.ai/design/...` URL과 검토 메모를 제출합니다.
5. 수정 요청 또는 Design 승인을 기록합니다.
6. 승인 후 PRD·Design Pack·handoff Markdown bundle을 다운로드합니다.

현재 `manual_claude_design` Connector는 Claude Design UI에서 실행합니다. 인증 기반 MCP/API 자동 실행은 후속 adapter이며 동일한 Design Job 상태 계약을 사용합니다.

디자인 확정 후 Claude Code:

```text
/design
Goodz web-shop Home·Shop 화면을 apps/web-shop에 반영해줘.
@goodz/ui Button/Card 사용, Sticky Lemon 톤 + violet CTA, pnpm verify 통과까지.
```

또는 Claude Design UI에서 **Send to Claude Code** 사용.

Cursor에서 이어갈 때:

- `docs/02-design/screens/*.md` + Claude Design 링크를 컨텍스트로 제공
- `skills/goodz-dev` 규칙 준수

---

## 5. 산출물 체크리스트 (P1 Gate)

- [x] Claude Design 프로젝트 생성 · 링크 등록 (아래)
- [x] `/design-sync` 로 goodz DS 반영 (초기 DS 프로젝트)
- [x] 쇼핑몰 10화면 + 어드민 2화면 프로토타입 (12화면)
- [x] `screens/` 12화면 스펙 인덱스
- [ ] `DESIGN_SYSTEM.md` Sticky Lemon 카테고리 색 매핑 (P2 handoff 시)
- [ ] 사용자 미리보기 최종 확인 (로그인 필요 — 에이전트 자동 검증 불가)

## 프로젝트 링크

| 항목 | 값 |
|------|-----|
| 프로젝트명 | Goodz — Web Shop MVP |
| **디자인 URL** | https://claude.ai/design/p/2bcbb8f0-f646-49bd-a975-3da8631b71e9 |
| **projectId** | `2bcbb8f0-f646-49bd-a975-3da8631b71e9` |
| DS sync projectId | `5c71eb8f-588d-4c5f-8720-ac761c87b03c` (`.design-sync/config.json`) |
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
| 이모지 깨짐 | 업로드 시 UTF-8 확인 (🧾 등) |

---

## 관련 문서

- [DESIGN_BRIEF.md](./DESIGN_BRIEF.md)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- [screens/README.md](./screens/README.md)
- [WORKFLOW.md](../00-process/WORKFLOW.md) P1 섹션
- [PHASE_GATES.md](../00-process/PHASE_GATES.md)
