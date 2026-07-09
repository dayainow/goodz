# Goodz 프로젝트 허브

> **Goodz는 쇼핑몰이 아니라, 쇼핑몰로 증명하는 풀 프로세스 모노레포 시스템입니다.**

👉 **[North Star](./docs/00-process/NORTH_STAR.md)** — 왜 이 프로젝트가 존재하는가 (필독)  
👉 [에이전트 가이드](./docs/00-process/AGENT_GUIDE.md) · [ROADMAP](./docs/01-planning/ROADMAP.md)

## 현재 스프린트: **S2 — 시스템 v0.2 (P1 디자인 파이프라인)**

| 시스템 레이어 | 이번 Sprint 목표 |
|---------------|------------------|
| **P1 디자인 파이프라인** | Claude Design 12화면 + `screens/` 스펙 |
| **P2 레퍼런스 데모** | MVP 플로우 ✅ · 어드민 등록 API ✅ |
| **품질 게이트** | `pnpm verify` + CI green ✅ |

## 현재 단계

| Phase | 상태 | 시스템 산출물 (제품) |
|-------|------|----------------------|
| **P0 기획** | 🟢 Gate 통과 | PRD · 유저스토리 · GA4 템플릿 |
| **P1 디자인** | 🟢 Gate 통과 | Claude Design · Tailwind 토큰 · Home/Shop 분리 |
| **P2 개발** | 🟡 UI handoff 진행 | Sticky Lemon 톤 1차 반영 |
| **P3 QA** | ⚪ 대기 | TEST_PLAN · GA compliance 게이트 |
| **P4 배포** | ⚪ 대기 | RELEASE_CHECKLIST |

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
- [x] P1→P2 Gate (`PHASE_GATES.md`) — Home/Shop 분리 · DS 토큰 반영

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
