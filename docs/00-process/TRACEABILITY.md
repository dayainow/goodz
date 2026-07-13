# Traceability — 기획에서 CI 증거까지

Goodz Process OS v0.4의 핵심은 **기획·변경·산출물·승인**을 실제 개발 증거와 연결하는 것입니다.  
사람이 읽는 원본은 이 문서이고, 대시보드가 읽는 SSOT는 `docs/00-process/status.json`의 `traceLinks`입니다.

## 추적 단위

| 단계 | ID 예시 | 의미 |
|------|---------|------|
| 기획 입력 | `IN-002` | 사용자 요청, 아이디어, 개선 제안 |
| 변경 요청 | `CR-002` | 기획/범위/운영 흐름 변경 |
| 산출물 | `D-12` | PRD, API, QA, 릴리스, 운영 문서 |
| 승인 | `AP-001` | Gate 또는 스프린트 승인 |
| 추적 링크 | `TL-002` | 위 항목과 Issue/PR/Commit/CI/Release를 묶는 단위 |

## Trace Link 상태

| 상태 | 의미 |
|------|------|
| `pending` | 요청만 있고 개발 증거가 아직 없음 |
| `partial` | 문서/산출물은 있으나 commit 또는 CI 증거가 아직 부족 |
| `linked` | commit과 CI run이 연결됨 |
| `released` | 릴리스 URL 또는 배포 증거까지 연결됨 |

## 운영 규칙

1. 새 요청은 먼저 `docs/01-planning/intake/` 또는 `docs/01-planning/changes/`에 기록합니다.
2. 산출물이 생기면 `docs/deliverables/README.md`와 `status.json.deliverables`에 등록합니다.
3. 작업이 코드로 이어지면 `traceLinks`에 Issue, PR, commit, CI run을 연결합니다.
4. 실제 Issue/PR이 없으면 값을 지어내지 않고 `pending` 또는 `not_required`로 남깁니다.
5. CI가 끝나면 `pnpm sync:github-trace`로 GitHub 증거를 자동 보강합니다.
6. `pnpm check:process`가 trace link의 ID 참조와 문서 경로를 검증합니다.

## 현재 Trace Links

| ID | 대상 | 상태 | 연결 |
|----|------|------|------|
| `TL-001` | Process OS v0.3 산출물 운영 | `linked` | `IN-001`, `CR-001`, `D-01`, `D-07`, `D-11`, `AP-001`, commit, CI run |
| `TL-002` | Traceability + CI/CD Evidence v0.4 | `linked` | `IN-002`, `CR-002`, `D-12`, `D-13`, commit, CI run |
| `TL-003` | DACI Approval Governance v0.5 | `linked` | `IN-003`, `CR-003`, `D-14`, `D-15`, `AP-003`, commit, CI run |
| `TL-004` | Roadmap + CI Runtime Maintenance v0.5.1 | `linked` | `IN-004`, `CR-004`, `D-16`, `D-17`, `AP-004`, commit, CI run |
| `TL-005` | GitHub Trace Sync + Evidence Alerts v0.6 | `linked` | `IN-005`, `CR-005`, `D-18`, `D-19`, `D-20`, `AP-005`, commit, CI run, smoke pass |
| `TL-006` | Delivery Metrics Baseline v0.7 | `linked` | `IN-006`, `CR-006`, `D-21`, `AP-006`, commit, CI run |
| `TL-007` | Timestamp Metrics v0.8 | `linked` | `IN-007`, `CR-007`, `D-22`, `AP-007`, commit `a4b2787`, CI `29218560782` |
| `TL-008` | Metrics Snapshot Trend v0.9 | `linked` | `IN-008`, `CR-008`, `D-23`, `AP-008`, commit `ee73ffa`, CI `29219254756` |
| `TL-009` | Docs Viewer + User Manual v0.10 | `linked` | `IN-009`, `CR-009`, `D-24`, `AP-009`, commit `73e9423`, CI `29219766920` |
| `TL-010` | Operator UX v0.11 | `linked` | `IN-010`, `CR-010`, `D-25`, `AP-010`, commit `1b0ae4e`, CI `29220409009` |

## CI 검증

```bash
pnpm check:process
```

GitHub 증거 동기화:

```bash
pnpm sync:github-trace
```

Metrics snapshot 저장:

```bash
pnpm snapshot:metrics
pnpm snapshot:metrics:check
```

검증 항목:

- `status.json`의 필수 배열 존재 여부
- 산출물·기획·변경·승인 문서 경로 존재 여부
- `traceLinks`가 존재하는 ID만 참조하는지 여부
- `linked`/`released` 상태의 trace link에 commit과 CI run이 있는지 여부
- `smoke` 증거가 있으면 command, summary, status가 올바른지 여부
- GitHub timestamp 필드가 있으면 ISO timestamp로 파싱 가능한지 여부
- metrics snapshot 파일이 있으면 snapshot schema와 timestamp를 검증하는지 여부
- 문서 뷰어 endpoint가 `docs/**/*.md`만 읽도록 제한되는지 여부

## 다음 고도화

- GitHub Issue/PR reviewer와 DACI 승인자 연결
- release URL 또는 배포 URL의 외부 호스팅 자동 검증
- 문서 검색, guided workflow, 수정 요청 생성, incident/MTTR과 PR review lead time snapshot 저장
