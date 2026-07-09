# Phase Gate — 단계 전환 기준

각 Phase를 다음 단계로 넘기기 전에 충족해야 할 **최소 기준**입니다.

## P0 → P1 (기획 → 디자인)

- [x] PRD v0.1 이상 작성 (`docs/01-planning/PRD.md`)
- [x] MVP 범위 확정 (상품 목록 · 장바구니 · 결제 · 어드민 상품관리)
- [x] 유저스토리 5개 이상 GitHub Issue 등록
- [x] GA4 핵심 퍼널 이벤트 초안 (`docs/01-planning/GA4_EVENTS.md`)

## P1 → P2 (디자인 → 개발)

- [x] Claude Design 프로젝트 링크 `docs/02-design/CLAUDE_DESIGN.md` 등록 (12화면)
- [x] `/design-sync`로 `@goodz/ui` · Tailwind DS 반영 (초기)
- [x] 쇼핑몰 10화면 + 어드민 2화면 프로토타입 (Sticky Lemon 톤)
- [x] `screens/` 12화면 스펙 인덱스
- [ ] `DESIGN_SYSTEM.md` Sticky Lemon 카테고리 색 ↔ 코드 매핑 (P2 handoff)
- [ ] 사용자 미리보기 최종 확인 (12화면·네비게이션)

## P2 → P3 (개발 → QA)

- [x] `pnpm verify` CI green
- [x] API `Product` CRUD (최소 Read + mock)
- [x] web-shop 상품 목록 API 연동
- [x] admin 상품 테이블 API 연동
- [ ] PR 1건 이상 merge (develop)

## P3 → P4 (QA → 배포)

- [ ] `docs/04-qa/TEST_PLAN.md` P0 시나리오 전부 pass
- [ ] `RELEASE_CHECKLIST.md` 스테이징 항목 완료
- [ ] GA compliance (해당 시)

## 승인

| Gate | 승인자 (예시) |
|------|----------------|
| P0→P1 | PM |
| P1→P2 | PM + Design Lead |
| P2→P3 | Tech Lead |
| P3→P4 | PM + QA |

개인 프로젝트에서는 본인이 체크리스트만 충족하면 진행 가능합니다.
