# Goodz 유저 스토리

형식: `As a [role], I want [goal], so that [benefit]`

## P0 — MVP

### US-001 상품 목록

- **As a** 쇼핑몰 고객
- **I want** 굿즈 상품 목록을 본다
- **So that** 구매할 상품을 고를 수 있다
- **AC**
  - [ ] API `/api/products`에서 `Product[]` 수신
  - [ ] 가격·이름·재고 표시
  - [ ] `@goodz/types.Product` 타입 일치

### US-002 어드민 상품 조회

- **As a** 운영자
- **I want** 어드민에서 상품 테이블을 본다
- **So that** 재고를 파악한다
- **AC**
  - [ ] 동일 API 데이터 테이블 표시
  - [ ] `@goodz/ui` Button 사용

### US-003 공통 UI

- **As a** 개발자
- **I want** 쇼핑몰·어드민이 같은 Button 컴포넌트를 쓴다
- **So that** UI 일관성·유지보수가 쉽다
- **AC**
  - [x] `@goodz/ui` Button 양 앱 import ✅

## P1 — 다음 스프린트

### US-010 장바구니 담기

- **I want** 상품을 장바구니에 담는다
- **AC** `Cart` 타입 in `@goodz/types`, API `POST /api/cart`

### US-011 체크아웃

- **I want** 결제하기 버튼으로 체크아웃 플로우 진입
- **AC** mock 결제 완료 페이지

---

GitHub Issue 생성 시 이 ID를 제목에 포함: `[US-001] 상품 목록`
