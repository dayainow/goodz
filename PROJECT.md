# Goodz 프로젝트 허브

> **Goodz는 쇼핑몰이 아니라, 쇼핑몰로 증명하는 풀 프로세스 모노레포 시스템입니다.**

👉 **[North Star](./docs/00-process/NORTH_STAR.md)** — 왜 이 프로젝트가 존재하는가 (필독)  
👉 [에이전트 가이드](./docs/00-process/AGENT_GUIDE.md) · [ROADMAP](./docs/01-planning/ROADMAP.md)

## 현재 스프린트: **S10 Timestamp Metrics v0.8** ✅

| 시스템 레이어 | 상태 |
|---------------|------|
| **P1 디자인** | ✅ 12화면 · Gate 통과 |
| **P2 레퍼런스 데모** | ✅ 쇼핑·어드민·Search/About UI |
| **프로세스 대시보드** | ✅ 기획·변경·산출물·DACI 승인·추적·Phase 관리 UI |
| **품질 게이트** | ✅ `pnpm verify` + GA harness + 브라우저 육안 QA |
| **산출물 레지스트리** | ✅ [deliverables](./docs/deliverables/README.md) |
| **승인 로그** | ✅ [APPROVALS](./docs/00-process/APPROVALS.md) · [DECISIONS](./docs/00-process/DECISIONS.md) |
| **추적 매트릭스** | ✅ [TRACEABILITY](./docs/00-process/TRACEABILITY.md) + CI 증거 |
| **CI 런타임** | ✅ GitHub Actions Node 24 + 최신 major actions |
| **증거 자동화** | ✅ [GITHUB_TRACE_SYNC](./docs/00-process/GITHUB_TRACE_SYNC.md) + 대시보드 누락 경고 |
| **Delivery Metrics** | ✅ [METRICS](./docs/00-process/METRICS.md) + 시간 단위 DORA 베이스라인 |

## 현재 단계

| Phase | 상태 | 시스템 산출물 (제품) |
|-------|------|----------------------|
| **P0 기획** | 🟢 Gate 통과 | PRD · 유저스토리 · GA4 템플릿 |
| **P1 디자인** | 🟢 Gate 통과 | Claude Design · Tailwind 토큰 · Home/Shop 분리 |
| **P2 개발** | 🟢 데모 + 대시보드 | Sticky Lemon UI · process-dashboard |
| **P3 QA** | 🟢 TEST_PLAN 통과 | 브라우저 QA · GA compliance |
| **P4 배포** | 🟢 release-ready | RELEASE_CHECKLIST · 스테이징 런북 · smoke · CI/CD evidence |

## 레퍼런스 구현체 (데모 — 최종 제품 아님)

| 앱 | 역할 |
|----|------|
| web-shop | B2C 퍼널 데모 |
| admin-dashboard | 운영 UI 데모 |
| api-server | REST + mock 패턴 |

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
