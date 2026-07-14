# Goodz 프로젝트 허브

> **Goodz는 쇼핑몰이 아니라, 쇼핑몰로 증명하는 풀 프로세스 모노레포 시스템입니다.**

👉 **[North Star](./docs/00-process/NORTH_STAR.md)** — 왜 이 프로젝트가 존재하는가 (필독)  
👉 [에이전트 가이드](./docs/00-process/AGENT_GUIDE.md) · [ROADMAP](./docs/01-planning/ROADMAP.md)

## 현재 스프린트: **S25 Visual Template Builder v0.23** ✅

| 시스템 레이어 | 상태 |
|---------------|------|
| **P1 디자인** | ✅ 12화면 · Design OS · 레퍼런스/와이어프레임/스토리보드 |
| **Dashboard Redesign PRD** | ✅ v1.0 승인 · Hero/Sidebar/Phase/Metrics 핵심 AC 반영 |
| **P2 레퍼런스 데모** | ✅ 쇼핑·어드민·Search/About UI |
| **프로세스 대시보드** | ✅ Premium White UI·Design 메뉴·검색/접힘 사이드바·Quick jump·콘솔형 헤더·가이드·산출물·DACI 승인·추적·Phase 관리 UI |
| **품질 게이트** | ✅ `pnpm verify` + GA harness + 브라우저 육안 QA |
| **산출물 레지스트리** | ✅ [deliverables](./docs/deliverables/README.md) |
| **승인 로그** | ✅ [APPROVALS](./docs/00-process/APPROVALS.md) · [DECISIONS](./docs/00-process/DECISIONS.md) |
| **추적 매트릭스** | ✅ [TRACEABILITY](./docs/00-process/TRACEABILITY.md) + CI 증거 |
| **CI 런타임** | ✅ GitHub Actions Node 24 + 최신 major actions |
| **증거 자동화** | ✅ [GITHUB_TRACE_SYNC](./docs/00-process/GITHUB_TRACE_SYNC.md) + 대시보드 누락 경고 |
| **Delivery Metrics** | ✅ [METRICS](./docs/00-process/METRICS.md) + 시간 단위 DORA 베이스라인 + snapshot trend |
| **서비스 매뉴얼** | ✅ [USER_MANUAL](./docs/00-process/USER_MANUAL.md) + 대시보드 문서 뷰어 |
| **Design OS** | ✅ [DESIGN_OS](./docs/02-design/DESIGN_OS.md) + [REFERENCES](./docs/02-design/REFERENCES.md) + Wireframes/Storyboards |
| **Premium White UI** | ✅ [PROCESS_DASHBOARD](./docs/00-process/PROCESS_DASHBOARD.md) + grouped metrics + Phase flow |
| **Template Onboarding** | ✅ [ONBOARDING](./docs/00-process/ONBOARDING.md) + template contract + standalone install |
| **White Premium Detail** | ✅ Quick Jump·CTA·metrics·phase·metadata·typography hierarchy |
| **Sidebar Comfort** | ✅ active disclosure·20px padding·fixed footer·custom scrollbar |
| **SQLite Operations** | ✅ 문서 인덱스·incident/MTTR·Render 영구 디스크 배포 구성 |
| **Platform Boundary** | ✅ `@goodz/process` Core 계약·Commerce Reference·API 라우터 경계·설정 스키마 |
| **Portability Proof** | ✅ Internal Service Reference·Core SHA-256 기준선·`check:portability` |
| **Writable Process** | ✅ Project·Run·Stage·Task·Gate command·SQLite audit |
| **Process Template Catalog** | ✅ 파일 기반 P0–P4·Phase 0–8·Template Builder·산출물/증거 command |
| **Visual Template Builder** | ✅ 기존 Template 복제·Stage 정렬·Task/산출물 편집·Live Blueprint·저장 검증 |

## 현재 단계

| Phase | 상태 | 시스템 산출물 (제품) |
|-------|------|----------------------|
| **P0 기획** | 🟢 Gate 통과 | PRD · 유저스토리 · GA4 템플릿 |
| **P1 디자인** | 🟢 Gate 통과 | Claude Design · Tailwind 토큰 · Design OS · 와이어프레임 · 스토리보드 |
| **P2 개발** | 🟢 데모 + 대시보드 | Sticky Lemon UI · process-dashboard |
| **P3 QA** | 🟢 TEST_PLAN 통과 | 브라우저 QA · GA compliance |
| **P4 배포** | 🟢 release-ready | RELEASE_CHECKLIST · 스테이징 런북 · smoke · CI/CD evidence |

## 레퍼런스 구현체 (데모 — 최종 제품 아님)

| 앱 | 역할 |
|----|------|
| web-shop | B2C 퍼널 데모 |
| admin-dashboard | 운영 UI 데모 |
| api-server | 현재 process/commerce 모듈을 함께 제공하는 전환 런타임 |
| internal-service | 비커머스 서비스 카탈로그 API와 독립 타입 패턴 |

## S2 체크리스트

- [x] Claude Design 프로토타입 URL → `CLAUDE_DESIGN.md`
- [x] `screens/` 12화면 스펙 확장
- [x] CI + Turbo cache + dep check ✅
- [x] 어드민 등록 mock (데모 + API.md) ✅
- [x] 프로세스 대시보드 → [PROCESS_DASHBOARD.md](./docs/00-process/PROCESS_DASHBOARD.md)
- [x] S3: TEST_PLAN P0 사전 검증 + GA harness pass
- [x] S3: TEST_PLAN P0 브라우저 육안 확인
- [x] P4: GitHub Actions CI green 확인
- [x] P4: 스테이징 env / 배포 준비
- [x] P4: smoke 명령 + 롤백 기준 문서화
- [x] S4: 기획 입력함 → [intake](./docs/01-planning/intake/README.md)
- [x] S4: 산출물 레지스트리 → [deliverables](./docs/deliverables/README.md)
- [x] S4: 대시보드 기획·산출물 메뉴
- [x] S4: 사용자 승인 로그 → [APPROVALS.md](./docs/00-process/APPROVALS.md)
- [x] S4: 문서 기반 기획 변경 로그 → [changes](./docs/01-planning/changes/README.md)
- [x] S5: Traceability 매트릭스 → [TRACEABILITY.md](./docs/00-process/TRACEABILITY.md)
- [x] S5: CI/CD 운영 문서 → [CICD.md](./docs/00-process/CICD.md)
- [x] S5: `pnpm check:process` + 대시보드 `추적` 메뉴
- [x] S6: DACI 승인 체계 → [APPROVALS.md](./docs/00-process/APPROVALS.md)
- [x] S6: 의사결정 로그 → [DECISIONS.md](./docs/00-process/DECISIONS.md)
- [x] S6: 대시보드 승인 메뉴 역할·기준 표시
- [x] S7: ROADMAP v0.5.1 정합성 정리
- [x] S7: GitHub Actions Node 24 런타임 전환
- [x] S8: GitHub trace 자동 동기화
- [x] S8: 대시보드 증거 누락 경고
- [x] S8: Release/Smoke evidence 연결 규칙
- [x] S9: Delivery Metrics 베이스라인
- [x] S9: 대시보드 지표 메뉴
- [x] S10: GitHub timestamp sync
- [x] S10: 요청→커밋→CI→증거 시간 단위 metrics
- [x] S11: Metrics snapshot 저장
- [x] S11: 대시보드 지표 추세 그래프
- [x] S12: 서비스 이용 매뉴얼
- [x] S12: 대시보드 문서 뷰어와 가이드 메뉴
- [x] S13: 사이드 메뉴 그룹화
- [x] S13: 개요 운영 브리핑 UX 고도화
- [x] S14: 사이드바 검색·Quick jump·접힘 그룹
- [x] S14: 콘솔형 메인 헤더와 프리미엄 UI polish
- [x] S15: Design OS 문서 구조
- [x] S15: 레퍼런스 보드·와이어프레임·스토리보드
- [x] S15: 대시보드 Design 메뉴
- [x] S16: Premium White UI 원칙 반영
- [x] S16: grouped metrics + P0-P4 phase flow
- [x] S16: 사이드바/카드 표면 고급화
- [x] S17: 30분 fork 온보딩 런북
- [x] S17: template.config.json + pnpm check:template
- [x] S17: 저장소 밖 로컬 의존성 제거
- [x] S18: Quick Jump와 사이드바 navigation cue 고도화
- [x] S18: CTA·metrics 역할별 시각 위계와 운영 문구 개선
- [x] S18: Noto Sans KR·line-height·scrollbar·hover detail tuning
- [x] S19: 활성 그룹 중심 sidebar disclosure
- [x] S19: 중첩 카드 제거와 navigation/footer 영역 분리
- [x] S19: stable gutter 기반 전용 scrollbar
- [x] S20: SQLite schema migration과 문서 인덱스 seed
- [x] S20: 운영 incident 생성·종료·MTTR API/UI
- [x] S20: Process OS 단일 서비스 Render Blueprint와 영구 디스크 런북
- [x] S21: Goodz Core와 Commerce Reference 타입/API 경계 분리
- [x] S21: `goodz.config.json` + JSON Schema + ADR-003
- [x] S22: Internal Service Reference 자체 타입·API·P0–P4 산출물
- [x] S22: Core 무변경 SHA-256 + Commerce 의존 0건 자동 검증
- [x] S23: 프로젝트 생성과 P0–P4 Template 실행
- [x] S23: Task 담당자·상태와 Stage 시작·차단 command
- [x] S23: GO/HOLD/KILL Gate guard·자동 진행·감사 이력
- [x] S24: Core 밖 파일 기반 P0–P4·Phase 0–8 Template Catalog
- [x] S24: 필수 산출물 제출·승인과 증거 연결 command
- [x] S24: Dashboard JSON Template Builder와 SQLite schema v3
- [x] S25: JSON 입력을 구조화된 Visual Template Builder로 교체
- [x] S25: Catalog 복제 편집과 Stage 순서 변경
- [x] S25: Live Blueprint·필수 필드·개수 제한 검증

## 풀 프로세스

```text
P0 기획 → P1 디자인 → P2 개발 → P3 QA → P4 배포
              ↑
         Phase Gate (docs/00-process/PHASE_GATES.md)
```

## 에이전트 진입점

| 도구 | 읽을 파일 |
|------|-----------|
| Cursor | `AGENTS.md`, `.cursor/rules/` |
| Claude Code | `CLAUDE.md` |
| 공통 | `NORTH_STAR.md`, `AGENT_GUIDE.md` |

## 저장소

- GitHub: https://github.com/dayainow/goodz
- 대외 소개: [README.md](./README.md)
