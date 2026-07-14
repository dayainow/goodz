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
- [x] `DESIGN_SYSTEM.md` Sticky Lemon 카테고리 색 ↔ Tailwind 토큰 매핑
- [x] web-shop Home(`/`) · Shop(`/shop`) 분리 + 파스텔 UI 1차 반영

## P2 → P3 (개발 → QA)

- [x] `pnpm verify` CI green
- [x] API `Product` CRUD (최소 Read + mock)
- [x] web-shop 상품 목록 API 연동
- [x] admin 상품 테이블 API 연동
- [x] `main` green 커밋 반영 (개인 프로젝트 직접 push 기준)

## P3 → P4 (QA → 배포)

- [x] `docs/04-qa/TEST_PLAN.md` P0 시나리오 전부 pass
- [x] `RELEASE_CHECKLIST.md` 스테이징 항목 완료
- [x] GA compliance (해당 시)
- [x] `STAGING_RUNBOOK.md` + `pnpm smoke:staging` 준비
- [x] SQLite migration·seed·incident lifecycle 로컬 검증
- [x] Process OS 영구 디스크 배포 구성 문서화
- [ ] 외부 URL에서 durability `persistent`와 재배포 보존 확인

## 승인

| Gate | 승인자 (예시) |
|------|----------------|
| P0→P1 | PM |
| P1→P2 | PM + Design Lead |
| P2→P3 | Tech Lead |
| P3→P4 | PM + QA |

개인 프로젝트에서는 본인이 체크리스트만 충족하면 진행 가능합니다.

## Goodz Core v1.0 Portability Gate

Goodz Commerce Reference 외 두 번째 도메인을 도입 가능한 플랫폼으로 판단하기 위한 별도 제품 Gate다.

- [x] Process OS 계약이 `@goodz/process`로 분리됨
- [x] Commerce 계약이 `@goodz/types`와 commerce route/data에 한정됨
- [x] `goodz.config.json`과 JSON Schema가 플랫폼/Reference 경계를 선언함
- [x] `pnpm check:template`이 경계 경로를 검증함
- [ ] 비커머스 Reference 1종이 `@goodz/process` 수정 0건으로 동작함
- [ ] `goodz init`, `goodz adopt`, `goodz verify` 기본 흐름이 동작함
- [ ] clean clone에서 설치·마이그레이션·전체 검증이 통과함

위 미완료 항목이 끝나기 전에는 Goodz Core를 v1.0 또는 Enterprise-ready로 표시하지 않는다.
