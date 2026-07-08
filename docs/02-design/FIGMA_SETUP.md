# Goodz Figma 설정 가이드 (보조)

> **P1 공식 도구는 [Claude Design](./CLAUDE_DESIGN.md)** 입니다.  
> 아래 가이드는 Figma를 보조로 쓸 때만 참고하세요.

> 파일: [Goodz — Web Shop](https://www.figma.com/design/nSXrd57yOCBdQEuSxn7evI)  
> fileKey: `nSXrd57yOCBdQEuSxn7evI`

Figma MCP 한도로 자동 구성이 중단된 경우, Cursor에서 아래 순서로 이어서 진행합니다.

## 사전 조건

```bash
cd /Users/dobedub/Documents/source/ax/goodz
pnpm dev   # web-shop :3000, api :4000
```

## Step 1 — 페이지 · 변수 (use_figma)

Cursor 채팅:

```text
/figma-use
fileKey nSXrd57yOCBdQEuSxn7evI
FIGMA_SETUP.md Step 1 스크립트 실행해줘
```

또는 Figma MCP `use_figma`에 `docs/02-design/figma-scripts/step1-foundations.js` 내용 붙여넣기.

## Step 2 — Button · Card 컴포넌트

```text
Goodz Figma fileKey nSXrd57yOCBdQEuSxn7evI
🧩 Components 페이지에 Button(primary/secondary/danger)와 Card 컴포넌트 만들어줘.
@goodz/ui Button.tsx 스타일 맞춰줘.
```

## Step 3 — 화면 캡처 (generate_figma_design)

로컬 dev 서버 실행 후 **화면마다 1회** 캡처:

| 화면 | URL |
|------|-----|
| 상품 목록 | http://localhost:3000/ |
| 상품 상세 | http://localhost:3000/products/gd-001 |
| 장바구니 | http://localhost:3000/cart |
| 체크아웃 | http://localhost:3000/checkout |

```text
/figma-generate-design
fileKey nSXrd57yOCBdQEuSxn7evI
localhost:3000 상품 목록 페이지 Screens 페이지에 캡처해줘
```

## Step 4 — 문서 갱신

완료 후 체크:

- [ ] `FIGMA.md` 화면별 node-id 링크
- [ ] `DESIGN_BRIEF.md` 체크리스트
- [ ] `DESIGN_SYSTEM.md` Figma ↔ 코드 매핑
- [ ] GitHub Issue #7 코멘트

## P1 Gate 완료 기준

`docs/00-process/PHASE_GATES.md` P1→P2:

- [x] Figma 링크 등록
- [ ] DS 컬러·타이포 변수
- [ ] 쇼핑몰 4화면 하이파이
- [ ] 어드민 상품 목록 (Admin 파일 또는 동일 파일 섹션)
