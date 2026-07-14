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
- [x] Writable Process project/task/GO lifecycle 로컬 검증
- [x] 미완료 Task가 있는 Stage의 GO 차단 검증
- [x] Gate GO 이후 다음 Stage 자동 시작과 audit event 검증
- [x] 현재 Stage가 아닌 단계의 시작·변경 차단 검증
- [x] 파일 기반 P0–P4와 Phase 0–8 Template 검증
- [x] 필수 산출물 승인 전 GO 차단 검증
- [x] 산출물 제출·승인과 Stage 증거 저장 lifecycle 검증
- [x] 사용자 Template 생성·SQLite 저장·실행 가능성 검증
- [x] Template Stage code가 Catalog 응답에 보존되는지 검증
- [x] 중복 Stage code Template 생성 차단 검증
- [x] Visual Builder 필수 필드·개수·길이 제한의 client/server 이중 검증
- [x] 빈 PRD 승인 차단과 완성 PRD Markdown 생성·승인 검증
- [x] PRD 승인 전 Design Pack 승인 차단 검증
- [x] 화면·스토리보드·콘셉트 기반 Claude Design handoff prompt 검증
- [x] Claude Design 결과 URL 포함 Design Pack 승인 lifecycle 검증
- [x] Design Job 생성·시작·제출·수정 필요·승인 상태와 prompt snapshot 검증
- [x] 승인 PRD·Design Pack·handoff portable export 검증
- [x] CLI Markdown materialize·hash manifest·dry-run·정상 재-export 검증
- [x] 로컬 수정 충돌과 경로 탈출·symbolic link write 차단 검증
- [x] 실제 Process API에서 CLI project create·export·verify smoke 통과
- [x] Git Connector의 clean tree·허용 파일 제한·branch/commit/push·PR 계약 검증
- [x] 승인 PRD 변경 시 downstream Design 승인 무효화 검증
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
- [x] 비커머스 Internal Service Reference가 `@goodz/process` 수정 0건으로 동작함
- [x] `pnpm check:portability`가 Core hash·독립 타입·P0–P4 증거를 검증함
- [x] `goodz init`, `goodz project create`, `goodz export`, `goodz verify` 기본 흐름이 동작함
- [x] `goodz adopt`가 기존 모노레포를 읽기 전용 분석하고 명시적 `--apply`로 설정함
- [x] Template 새 버전 생성과 기존 Run version 고정이 동작함
- [ ] config migration과 clean-clone 설치가 동작함
- [ ] clean clone에서 설치·마이그레이션·전체 검증이 통과함

위 미완료 항목이 끝나기 전에는 Goodz Core를 v1.0 또는 Enterprise-ready로 표시하지 않는다.
