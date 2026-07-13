# 승인 로그 — DACI Governance

Goodz Process OS의 Phase Gate와 주요 스프린트 산출물 승인 기록입니다.  
기계 판독 상태는 `docs/00-process/status.json`의 `approvals` 필드를 SSOT로 사용합니다.

## DACI 역할

| 역할 | 의미 | Goodz 기준 |
|------|------|------------|
| Driver | 승인까지 몰고 가는 책임자 | 산출물 준비, 기준 확인, trace link 갱신 |
| Approver | 최종 결정권자 | 진행/반려/수정 요청 결정 |
| Contributors | 의견과 근거를 제공하는 사람/역할 | PM, Engineering, QA, DevOps |
| Informed | 결정 후 공유 대상 | 운영자, 협업 에이전트, 외부 독자 |

## 승인 내역

| ID | 대상 | Driver | Approver | 상태 | Trace |
|----|------|--------|----------|------|-------|
| AP-001 | S4 Process OS v0.3 | Codex | 사용자 | approved | TL-001 |
| AP-002 | S5 Traceability + CI/CD Evidence v0.4 | Codex | 사용자 | approved | TL-002 |
| AP-003 | S6 DACI Approval Governance v0.5 | Codex | 사용자 | approved | TL-003 |
| AP-004 | S7 Roadmap + CI Runtime Maintenance v0.5.1 | Codex | 사용자 | approved | TL-004 |
| AP-005 | S8 GitHub Trace Sync + Evidence Alerts v0.6 | Codex | 사용자 | approved | TL-005 |
| AP-006 | S9 Delivery Metrics Baseline v0.7 | Codex | 사용자 | approved | TL-006 |
| AP-007 | S10 Timestamp Metrics v0.8 | Codex | 사용자 | approved | TL-007 |
| AP-008 | S11 Metrics Snapshots v0.9 | Codex | 사용자 | approved | TL-008 |

## 승인 기준

승인 레코드는 아래 필드를 모두 가져야 합니다.

| 필드 | 설명 |
|------|------|
| `type` | `phase_gate`, `sprint`, `deliverable`, `change`, `release` |
| `driver` | 진행 책임자 |
| `approver` | 최종 승인자 |
| `contributors` | 검토·의견 제공자 |
| `informed` | 공유 대상 |
| `criteria` | 승인 기준 |
| `decision` | 실제 결정 문장 |
| `traceLinkIds` | 연결된 trace link |

## 운영 규칙

1. 새 Phase Gate, 스프린트, 릴리스는 `requested` 상태로 승인 레코드를 먼저 만듭니다.
2. Driver는 산출물, 검증 결과, trace link를 준비합니다.
3. Approver가 승인하면 `approved`, 수정 요청이면 `changes_requested`로 기록합니다.
4. 승인 기준과 결정 문장은 반드시 사람이 읽을 수 있게 남깁니다.
5. `pnpm check:process`가 DACI 필드와 trace link 참조를 검증합니다.

## 다음 확장

- 승인 SLA 또는 due date
- 변경 요청과 승인 재요청 이력
- GitHub Issue/PR reviewer와 승인자 자동 연결
- DORA/Delivery Metrics와 승인 리드타임 연결
