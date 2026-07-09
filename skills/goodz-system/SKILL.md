---
name: goodz-system
description: |
  Goodz 풀 프로세스 모노레포 시스템 메타 스킬.
  "시스템", "프로세스", "North Star", "Phase Gate", "온보딩", "템플릿", "판매",
  "가이드", "워크플로우", "CI", "스캐폴드" 키워드 시 적용.
  쇼핑몰 기능이 아닌 시스템·문서·게이트 작업 시 사용.
---

# Goodz System Skill

## 목적

Goodz의 **진짜 제품**은 풀 프로세스 모노레포 **시스템**입니다.  
이 스킬은 데모 앱이 아닌 **시스템 레이어**를 강화할 때 씁니다.

필독: `docs/00-process/NORTH_STAR.md`

## 시스템 산출물 맵

| 레이어 | 경로 |
|--------|------|
| North Star | `docs/00-process/NORTH_STAR.md` |
| 에이전트 가이드 | `docs/00-process/AGENT_GUIDE.md` |
| 워크플로우 | `docs/00-process/WORKFLOW.md` |
| Phase Gate | `docs/00-process/PHASE_GATES.md` |
| 로드맵 | `docs/01-planning/ROADMAP.md` |
| 허브 | `PROJECT.md` |
| Cursor 규칙 | `.cursor/rules/` |
| Claude Code | `CLAUDE.md` |
| 스킬 | `skills/goodz-*/` |
| CI | `.github/workflows/ci.yml` |

## 작업 유형

| 유형 | 예시 | 완료 시 |
|------|------|---------|
| Gate 정의 | P1→P2 기준 갱신 | `PHASE_GATES.md` |
| 온보딩 | README, AGENT_GUIDE | fork 가능한 설명 |
| CI/품질 | verify, turbo cache | `ARCHITECTURE.md`, ADR |
| 스킬·규칙 | 에이전트 협업 | `AGENTS.md`, `skills/` |
| 연동 패턴 | GA harness | 문서 + 예시 코드 |

## 완료 보고 (필수)

- 어떤 **시스템 v0.x** 목표에 기여했는지
- 갱신한 문서 목록
- 데모 앱 변경이 있다면 **어떤 패턴을 보여주는지** (SSOT, API, handoff 등)

## 금지

- “시스템” 없이 데모 기능만 확장
- NORTH_STAR와 모순되는 목표 설정
