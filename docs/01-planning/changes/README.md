# 기획 변경 로그

Goodz는 기획을 대시보드 폼이 아니라 **문서 기반**으로 입력하고 수정합니다.  
기획 변경이 필요할 때는 이 폴더에 변경 요청서를 만들고, `references/goodz-internal/status.json`의 `planningChanges`에 등록합니다.

## 변경 절차

1. `docs/01-planning/changes/YYYY-MM-DD-title.md` 파일을 작성합니다.
2. 변경 대상 문서와 변경 이유를 명확히 적습니다.
3. `status.json`의 `planningChanges`에 항목을 추가합니다.
4. 승인되면 대상 문서를 수정하고 상태를 `applied`로 변경합니다.
5. 대시보드 `변경` 메뉴에서 상태를 확인합니다.

## 상태값

| 상태 | 의미 |
|------|------|
| `proposed` | 변경 제안 |
| `approved` | 변경 승인, 아직 반영 전 |
| `applied` | 대상 문서에 반영 완료 |
| `rejected` | 반려 |

## 현재 변경 요청

- [CR-001 문서 기반 기획 수정 체계](./2026-07-10-planning-change-flow.md)
