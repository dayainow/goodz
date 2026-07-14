# Goodz Product Development Reference

이 디렉터리는 Goodz 제품 자체를 개발하면서 쌓인 Sprint, IN, CR, DR, TL, 승인, 지표 이력을 보관합니다.

- 사용자 Workspace의 초기 데이터가 아닙니다.
- `goodz.config.json`에 `platform.internalReference`가 명시된 Goodz 개발 저장소에서만 Dashboard에 노출됩니다.
- 신규 `goodz init` 설치는 이 설정과 데이터를 생성하지 않으며 빈 Operations DB에서 시작합니다.
- 일반 프로젝트의 PRD, Design Pack, Run, Task, Evidence와 Gate는 프로젝트별 Operations DB와 `docs/projects/`에 저장합니다.

| 파일 | 역할 |
|---|---|
| `status.json` | Goodz 자체 개발 이력 projection |
| `metrics-snapshots.json` | Goodz 자체 Delivery Metrics snapshot |

이 디렉터리를 제거해도 Goodz Core, CLI, 사용자 Workspace와 Process Dashboard의 프로젝트 관리 기능은 동작해야 합니다.
