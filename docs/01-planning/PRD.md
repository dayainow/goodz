# Goodz PRD (Product Requirements Document)

> **Reference notice:** 이 문서는 Goodz Commerce Reference의 초기 MVP PRD다. Goodz 플랫폼 또는 후속 로컬 Project OS의 제품 PRD가 아니다. 후속 제품 범위는 [PRD-SUCCESSOR-SPINOUT.md](./PRD-SUCCESSOR-SPINOUT.md)를 따른다.

| 항목 | 내용 |
|------|------|
| 제품명 | **Goodz** — 굿즈 전문 이커머스 |
| 버전 | v0.1 (MVP) |
| 상태 | **Approved** (S1) |
| 플랫폼 | Web (쇼핑몰) + Admin + API |

## 1. 문제 정의

캐릭터·브랜드 굿즈를 한곳에서 탐색·구매할 수 있는 쇼핑 경험이 필요합니다.  
운영팀은 상품·재고를 어드민에서 관리해야 합니다.

## 2. 목표 (MVP)

- 고객: 상품 목록 조회 → 장바구니 → 결제 플로우 (결제는 mock)
- 운영: 상품 목록·재고 조회 (어드민)
- 기술: 타입 안전 풀스택 모노레포, CI 검증

## 3. 비목표 (MVP 제외)

- 실결제 PG 연동
- 회원가입/로그인 (P1 이후)
- 리뷰·추천 알고리즘

## 4. 사용자 페르소나

| 페르소나 | 니즈 |
|----------|------|
| 굿즈 수집가 | 신규 굿즈 빠르게 찾기, 재고 확인 |
| 운영 매니저 | 상품 등록·재고 파악 |

## 5. 핵심 기능

| ID | 기능 | 우선순위 | 앱 |
|----|------|----------|-----|
| F-01 | 상품 목록 | P0 | web-shop |
| F-02 | 상품 상세 | P0 | web-shop |
| F-03 | 장바구니 | P1 | web-shop |
| F-04 | 체크아웃( mock ) | P1 | web-shop |
| F-05 | 상품 관리 테이블 | P0 | admin |
| F-06 | Product API | P0 | api-server |

## 6. 성공 지표 (초기)

- `pnpm verify` CI 100% pass
- GA4 핵심 퍼널 이벤트 정의·검증 완료
- 로컬 데모 3앱 동시 기동

## 7. 일정 (예시)

| Sprint | 기간 | 목표 |
|--------|------|------|
| S0 | 완료 | 모노레포 스캐폴드 ✅ |
| **S1** | **현재** | P0 Gate + 상품 상세·장바구니·체크아웃 |
| S2 | +2주 | Claude Design P1 · 어드민 등록 |
| S3 | +3주 | QA + 스테이징 배포 |

## 8. 관련 문서

- [USER_STORIES.md](./USER_STORIES.md)
- [ROADMAP.md](./ROADMAP.md)
- [GA4_EVENTS.md](./GA4_EVENTS.md)
- [../02-design/DESIGN_BRIEF.md](../02-design/DESIGN_BRIEF.md)
