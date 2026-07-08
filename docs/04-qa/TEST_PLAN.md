# Goodz 테스트 플랜

## 자동화 (CI)

| 검사 | 명령 | 트리거 |
|------|------|--------|
| Build + Lint | `pnpm verify` | PR, push main/develop |

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

## GA (P1)

- Notion export → `ga-analytics-harness` compliance

## 회귀

PR마다 CI green + TC-001~003 스팟 체크 (릴리스 전 전체)
