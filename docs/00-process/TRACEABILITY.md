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
5. `pnpm check:process`가 trace link의 ID 참조와 문서 경로를 검증합니다.

## 현재 Trace Links

| ID | 대상 | 상태 | 연결 |
|----|------|------|------|
| `TL-001` | Process OS v0.3 산출물 운영 | `linked` | `IN-001`, `CR-001`, `D-01`, `D-07`, `D-11`, `AP-001`, commit, CI run |
| `TL-002` | Traceability + CI/CD Evidence v0.4 | `linked` | `IN-002`, `CR-002`, `D-12`, `D-13`, commit, CI run |

## CI 검증

```bash
pnpm check:process
```

검증 항목:

- `status.json`의 필수 배열 존재 여부
- 산출물·기획·변경·승인 문서 경로 존재 여부
- `traceLinks`가 존재하는 ID만 참조하는지 여부
- `linked`/`released` 상태의 trace link에 commit과 CI run이 있는지 여부

## 다음 고도화

- GitHub Issue/PR URL 자동 수집
- merge commit과 CI run id 자동 반영
- release URL 또는 배포 URL 연결
- 대시보드에서 trace link 누락 항목을 경고로 표시
