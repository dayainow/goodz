# Goodz 유저 스토리

형식: `As a [role], I want [goal], so that [benefit]`

## P0 — MVP

### US-001 상품 목록

- **As a** 쇼핑몰 고객
- **I want** 굿즈 상품 목록을 본다
- **So that** 구매할 상품을 고를 수 있다
- **AC**
  - [x] API `/api/products`에서 `Product[]` 수신
  - [x] 가격·이름·재고 표시
  - [x] `@goodz/types.Product` 타입 일치

### US-002 어드민 상품 조회

- **As a** 운영자
- **I want** 어드민에서 상품 테이블을 본다
- **So that** 재고를 파악한다
- **AC**
  - [x] 동일 API 데이터 테이블 표시
  - [x] `@goodz/ui` Button 사용

### US-003 공통 UI

- **As a** 개발자
- **I want** 쇼핑몰·어드민이 같은 Button 컴포넌트를 쓴다
- **So that** UI 일관성·유지보수가 쉽다
- **AC**
  - [x] `@goodz/ui` Button 양 앱 import

### US-004 상품 상세

- **As a** 쇼핑몰 고객
- **I want** 상품 상세 정보를 본다
- **So that** 구매 여부를 결정할 수 있다
- **AC**
  - [x] `GET /api/products/:id` 연동
  - [x] 이름·설명·가격·재고·카테고리 표시
  - [x] 목록에서 카드 클릭 시 상세로 이동
  - [x] 장바구니 담기 CTA

## P1 — 쇼핑 플로우

### US-010 장바구니 담기

- **As a** 쇼핑몰 고객
- **I want** 상품을 장바구니에 담는다
- **So that** 여러 상품을 한 번에 주문할 수 있다
- **AC**
  - [x] `Cart` 타입 in `@goodz/types`
  - [x] API `POST /api/cart/items` · `GET /api/cart`
  - [x] `/cart` 페이지에서 담긴 상품·수량·합계 표시

### US-011 체크아웃

- **As a** 쇼핑몰 고객
- **I want** 결제하기 버튼으로 체크아웃 플로우에 진입한다
- **So that** 주문을 완료할 수 있다
- **AC**
  - [x] `/checkout` 페이지
  - [x] `POST /api/checkout` mock 결제
  - [x] 결제 완료 페이지 표시

---

GitHub Issue 생성 시 이 ID를 제목에 포함: `[US-001] 상품 목록`

Sprint 백로그: [ROADMAP.md](./ROADMAP.md)

## Repository Closure — 후속 제품 분리

### US-100 재현 가능한 Goodz 종료 기준선

- **As a** 후속 제품 개발자
- **I want** Goodz의 최종 상태와 검증 결과를 재현한다
- **So that** 검증되지 않은 코드나 문서를 새 제품으로 옮기지 않는다
- **AC**
  - [x] 기능 동결 결정과 후속 제품 비목표가 문서화된다.
  - [x] 이식·제외 코드가 경로 단위로 분류된다.
  - [x] Reference 없는 빈 Workspace Dashboard를 육안 확인한다.
  - [x] 최종 `pnpm verify`가 통과한다.

### US-101 선택적 코드 이식

- **As a** 후속 제품 개발자
- **I want** 새 계약에 필요한 Goodz 코드만 선별 이식한다
- **So that** 현재 저장소의 누적 복잡도를 새 제품에 복사하지 않는다
- **AC**
  - [x] 기존 Dashboard 전체 복사가 금지된다.
  - [x] Commerce와 내부 Reference가 이식 대상에서 제외된다.
  - [x] 새 제품 첫 세로 흐름이 `beacon init → beacon open → identity`로 고정된다.
  - [x] 새 제품 이름이 Beacon으로 확정된다.
  - [x] Beacon 저장소가 생성되고 원격 URL이 확정된다.

### US-102 단일 프로젝트 로컬 실행

- **As a** 프로젝트 팀원
- **I want** 실제 프로젝트 폴더에서 Dashboard를 연다
- **So that** 별도 서비스에 프로젝트와 Evidence를 다시 입력하지 않는다
- **AC**
  - [ ] 프로젝트 폴더 하나가 프로젝트 하나로 인식된다.
  - [ ] CLI가 현재 폴더의 로컬 runtime과 Dashboard를 연다.
  - [ ] 첫 화면에 샘플 데이터 없이 현재 폴더의 정체성이 표시된다.
  - [ ] 로컬 파일과 Git 탐색 결과에 출처가 표시된다.
