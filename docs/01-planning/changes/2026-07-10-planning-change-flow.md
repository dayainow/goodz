# CR-001 문서 기반 기획 수정 체계

## 요청

기획 입력은 문서 기반으로 유지하되, 기획 수정이 있을 때 수정 요청과 반영 상태를 추적할 수 있어야 한다.

## 배경

대시보드 직접 편집은 편하지만 초기 Goodz Process OS에는 과합니다.  
스타트업 실무에서는 기획 변경의 이유, 영향 범위, 승인 여부가 Git에 남는 것이 더 중요합니다.

## 결정

- 기획 입력은 `docs/01-planning/intake/`에 유지합니다.
- 기획 수정은 `docs/01-planning/changes/`에 변경 요청서로 작성합니다.
- 변경 요청은 `references/goodz-internal/status.json`의 `planningChanges`에 등록합니다.
- 대시보드는 `변경` 메뉴에서 변경 요청의 상태와 대상 문서를 보여줍니다.

## 대상 문서

- `docs/01-planning/intake/README.md`
- `docs/01-planning/changes/README.md`
- `references/goodz-internal/status.json`
- `apps/process-dashboard/src/App.tsx`

## 반영 상태

`applied`

## 다음 확장

- 변경 요청 ID 자동 생성
- 승인자/승인일 분리
- 변경 요청에서 대상 산출물 자동 연결
