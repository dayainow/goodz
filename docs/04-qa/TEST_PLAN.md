# Goodz 테스트 플랜

## 자동화 (CI)

| 검사 | 명령 | 트리거 |
|------|------|--------|
| Build + Lint | `pnpm verify` | PR, push main/develop |
| GA 이벤트 캡처 | `pnpm --filter @goodz/web-shop test:analytics` | PR, GA 변경 |
| GA spec compliance | `pnpm --filter @goodz/web-shop analytics:compliance` | PR, GA 변경 |

## P0 수동 시나리오

### TC-001 API 상품 목록

1. `pnpm dev` 또는 api만 기동
2. `curl localhost:4000/api/products`
3. **Expected:** JSON `products` 배열, `total >= 1`

### TC-002 쇼핑몰 목록

1. http://localhost:3000 접속
2. **Expected:** 굿즈 상품 카드 3개 이상, 가격 표시

### TC-003 어드민 테이블

1. http://localhost:5173 접속
2. **Expected:** 상품 테이블, Button 2개 (CSV, 등록)

### TC-004 공통 UI

1. 쇼핑몰·어드민 Button 스타일 확인
2. **Expected:** violet primary, 동일 border-radius

### TC-005 프로세스 대시보드

1. http://localhost:5180 접속
2. **Expected:** Sprint S2 · Phase P0–P4 패널 · 앱 링크 4개

### TC-006 검색 · About

1. http://localhost:3000/search?q=스티커
2. **Expected:** 필터된 상품 그리드
3. http://localhost:3000/about — 브랜드 소개 표시

## GA (P1)

- `events.spec.yaml` ↔ `src` compliance
- 상품 카드 클릭 · 장바구니 담기 이벤트 캡처
- Notion export → `ga-analytics-harness` compliance (선택)

## 실행 기록

### 2026-07-10 — S3 QA 브라우저 확인

| 항목 | 결과 | 확인 |
|------|------|------|
| TC-001 API 상품 목록 | ✅ Pass | `/api/products` 200 · `total = 8` |
| TC-002 쇼핑몰 목록 | ✅ Pass | 사용자 제공 브라우저 스크린샷: Home · 카테고리 · NEW IN · 가격 표시 |
| TC-003 어드민 테이블 | ✅ Pass | 사용자 제공 브라우저 스크린샷: 상품 테이블 · CSV보내기 · 상품 등록 |
| TC-004 공통 UI | ✅ Pass | 사용자 제공 브라우저 스크린샷: violet primary 버튼 · rounded UI 일관성 |
| TC-005 프로세스 대시보드 | ✅ Pass | 사용자 제공 브라우저 스크린샷: Sprint S2 · Phase P0–P4 · 앱/진행 패널 |
| TC-006 검색 · About | ✅ Pass | 사용자 제공 브라우저 스크린샷: `/search?q=스티커` 1건 · `/about` 브랜드 소개 |
| GA 이벤트 테스트 | ✅ Pass | `test:analytics` 2 tests pass |
| GA compliance | ✅ Pass | compliance pass · 경고 5건은 추적 제외 후보 |

## 회귀

PR마다 CI green + TC-001~003 스팟 체크 (릴리스 전 전체)
