# Goodz 산출물 레지스트리

Goodz는 쇼핑몰 코드보다 **기획 → 디자인 → 개발 → QA → 배포 산출물이 남는 풀프로세스**를 제품으로 봅니다.  
이 문서는 `docs/00-process/status.json`의 `deliverables`와 연결되는 사람용 인덱스입니다.

## 산출물 맵

| ID | Phase | 산출물 | 원본 문서 | Owner | 상태 |
|----|-------|--------|-----------|-------|------|
| D-01 | P0 | 기획 입력서 | [Process OS v0.3](../01-planning/intake/2026-07-10-process-os-v03.md) | PM | 완료 |
| D-02 | P0 | PRD | [PRD.md](../01-planning/PRD.md) | PM | 완료 |
| D-03 | P0 | 유저스토리 | [USER_STORIES.md](../01-planning/USER_STORIES.md) | PM | 완료 |
| D-04 | P1 | 화면 설계 | [screens/README.md](../02-design/screens/README.md) | Design | 완료 |
| D-05 | P1 | 디자인 시스템 | [DESIGN_SYSTEM.md](../02-design/DESIGN_SYSTEM.md) | Design | 완료 |
| D-06 | P2 | API 명세 | [API.md](../03-engineering/API.md) | Engineering | 완료 |
| D-07 | P2 | 프로세스 대시보드 명세 | [PROCESS_DASHBOARD.md](../00-process/PROCESS_DASHBOARD.md) | Engineering | 완료 |
| D-08 | P3 | QA 테스트 계획 | [TEST_PLAN.md](../04-qa/TEST_PLAN.md) | QA | 완료 |
| D-09 | P4 | 릴리스 체크리스트 | [RELEASE_CHECKLIST.md](../04-qa/RELEASE_CHECKLIST.md) | DevOps | 완료 |
| D-10 | P4 | 스테이징 런북 | [STAGING_RUNBOOK.md](../04-qa/STAGING_RUNBOOK.md) | DevOps | 완료 |
| D-11 | P0 | 기획 변경 로그 | [changes/README.md](../01-planning/changes/README.md) | PM | 완료 |
| D-12 | P2 | Traceability 매트릭스 | [TRACEABILITY.md](../00-process/TRACEABILITY.md) | PM/Engineering | 완료 |
| D-13 | P4 | CI/CD 운영 문서 | [CICD.md](../00-process/CICD.md) | DevOps | 완료 |
| D-14 | P2 | DACI 승인 체계 | [APPROVALS.md](../00-process/APPROVALS.md) | PM/Operations | 완료 |
| D-15 | P2 | 의사결정 로그 | [DECISIONS.md](../00-process/DECISIONS.md) | PM/Operations | 완료 |
| D-16 | P0 | ROADMAP v0.5 정합성 정리 | [ROADMAP.md](../01-planning/ROADMAP.md) | PM | 완료 |
| D-17 | P4 | CI Node 24 런타임 전환 | [CICD.md](../00-process/CICD.md) | DevOps | 완료 |
| D-18 | P2 | GitHub Trace Sync | [GITHUB_TRACE_SYNC.md](../00-process/GITHUB_TRACE_SYNC.md) | Engineering/DevOps | 완료 |
| D-19 | P2 | Evidence Alerts | [PROCESS_DASHBOARD.md](../00-process/PROCESS_DASHBOARD.md) | Engineering | 완료 |
| D-20 | P4 | Release/Smoke Evidence | [STAGING_RUNBOOK.md](../04-qa/STAGING_RUNBOOK.md) | DevOps/QA | 완료 |
| D-21 | P2 | Delivery Metrics Baseline | [METRICS.md](../00-process/METRICS.md) | PM/Engineering/DevOps | 완료 |

## 운영 규칙

1. 새 요청은 먼저 `docs/01-planning/intake/`에 기록합니다.
2. 산출물이 생기면 `docs/00-process/status.json`의 `deliverables`에 등록합니다.
3. 대시보드 `산출물` 메뉴에서 phase, owner, 상태를 확인합니다.
4. Phase Gate를 넘길 때 해당 phase의 필수 산출물이 모두 `done`인지 확인합니다.
5. 승인 시 `APPROVALS.md`와 `traceLinks`에 DACI 역할과 결정 기준을 연결합니다.
6. 개발 증거가 생기면 `traceLinks`에 Issue/PR/Commit/CI/Release를 연결합니다.
7. CI 완료 후 `pnpm sync:github-trace`로 자동 수집 가능한 증거를 보강합니다.

## 다음 확장

- 산출물 승인자와 승인일
- 변경 이력 요약
- GitHub timestamp 기반 시간 단위 Metrics
