---
name: goodz-planning
description: |
  Goodz 기획 단계 스킬 — PRD, 유저스토리, GA4 명세, Phase Gate.
  "기획", "PRD", "유저스토리", "요구사항", "GA4", "Notion" 키워드 시 적용.
---

# Goodz Planning Skill

## 산출물 위치

| 문서 | 경로 |
|------|------|
| PRD | `docs/01-planning/PRD.md` |
| 유저스토리 | `docs/01-planning/USER_STORIES.md` |
| GA4 | `docs/01-planning/GA4_EVENTS.md` |
| Phase Gate | `docs/00-process/PHASE_GATES.md` |

## 워크플로우

1. PRD 목표·범위 확인
2. 유저스토리 ID 부여 (US-xxx)
3. GitHub Issue `01-planning` 또는 `02-feature` 템플릿 생성
4. GA4 필요 시 Notion 표 → `ga-analytics-harness` 연동 검토
5. P0→P1 Gate 체크리스트 검토

## 규칙

- 코드 변경 없이 기획만 할 때는 `docs/` + Issue만 수정
- MVP 범위 밖 기능은 PRD "비목표"에 명시
- AC는 테스트 가능한 문장으로 작성

## 완료 기준

- PRD·유저스토리 갱신
- `PROJECT.md` Phase 표 업데이트 (해당 시)
- P1 디자인 착수 이슈 생성
