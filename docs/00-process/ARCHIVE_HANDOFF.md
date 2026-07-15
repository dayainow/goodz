# Goodz 저장소 종료 및 후속 제품 인계

| 항목 | 내용 |
|------|------|
| 결정일 | 2026-07-15 |
| 상태 | QA complete — Cursor release 작업 대기 |
| 최종 기준선 | Goodz v1.1 Installable Empty Workspace |
| 종료 태그 후보 | `v1.1.0` |
| 후속 제품 | Beacon — 별도 저장소 |
| 후속 저장소 | [dayainow/beacon-project-os](https://github.com/dayainow/beacon-project-os) |
| 공개 범위 | Public |

## 종료 정의

Goodz는 풀프로세스 모노레포 시스템의 가능성을 검증한 제품·연구 기준선으로 마무리한다. 종료는 모든 백로그를 구현한다는 의미가 아니라, 현재 산출물이 재현 가능하고 후속 제품이 출처와 한계를 이해한 상태에서 필요한 부분만 이식할 수 있게 고정한다는 의미다.

종료 이후 이 저장소에서는 보안·재현성 결함 외 신규 제품 기능을 추가하지 않는다.

## 검증된 결과

- P0–P4 문서와 Phase Gate
- `@goodz/process` 기반 Process 계약
- Project·Run·Stage·Task·Deliverable·Evidence·Gate·Audit 실행 모델
- 파일 기반 Process Template Catalog
- SQLite 운영 저장소와 migration
- `init`, `adopt`, `verify`, export와 제한된 Git publish 패턴
- 빈 Workspace와 Goodz 내부 Reference의 경계
- Commerce 및 비커머스 Reference를 통한 이식성 검증
- clean-clone, portability와 전체 `pnpm verify` 품질 Gate

## 종료 체크리스트

- [x] 신규 기능 동결 결정 기록
- [x] 후속 제품 PRD와 비목표 기록
- [x] 이식·제외 대상을 매니페스트로 분류
- [x] 사용자 Workspace와 Goodz 내부 Reference 코드 경계 구현
- [x] 빈 Workspace HTTP smoke 통과
- [x] Reference 없는 Dashboard 로컬 육안 QA
- [x] 최종 `pnpm verify` 통과
- [x] 기존 미커밋 Dashboard 가독성 변경을 보존하고 build·lint 확인
- [x] Beacon 공개 빈 저장소 생성과 원격 URL 확인
- [ ] Cursor가 종료 문서와 코드 변경 commit
- [ ] Cursor가 최종 tag와 GitHub Release 생성
- [x] README에 후속 저장소 링크 추가

### 빈 Workspace 육안 QA 기록

- 확인일: 2026-07-15
- API: 프로젝트 0개, 실행 0개, 기본 Template 2개, Internal Reference 비활성
- 화면: 프로젝트·실행·결정 대기열 모두 0, Goodz Internal Reference와 Commerce 샘플 미노출
- 확인자: 사용자 직접 확인

## 종료 후 저장소 정책

- 기본 브랜치는 재현 가능한 기준선으로 유지한다.
- 미완료 후보 기능은 후속 제품으로 자동 승계하지 않는다.
- Goodz Commerce와 Internal Service는 제품 기능이 아니라 Reference로만 해석한다.
- 후속 제품은 이 저장소를 runtime dependency로 사용하지 않는다.
- 필요한 코드는 [TRANSFER_MANIFEST](./TRANSFER_MANIFEST.md)의 승인 단위로 복사하고 새 계약에 맞게 축소한다.

## Beacon의 첫 목표

```text
프로젝트 폴더에서 CLI 실행
→ 현재 폴더를 단일 프로젝트로 인식
→ 로컬 Dashboard 열기
→ 정체성·탐색 결과·부족한 항목 표시
```

후속 제품의 기본 메뉴는 개요, 프로세스, 산출물, 히스토리, 설정으로 제한한다. Portfolio, 조직 관리, Cloud, Template Builder, DORA 상세 화면, Commerce Reference와 AI 자동 판단은 MVP에 포함하지 않는다.

제품 표시명은 **Beacon**으로 고정한다. 권장 저장소 slug는 동명 개발 도구와의 혼동을 줄이기 위해 `beacon-project-os`를 사용한다. CLI 명령은 `beacon`, 프로젝트 로컬 상태는 `.beacon/`을 기본 후보로 하며 package scope는 새 저장소 소유 조직을 확인한 뒤 확정한다.

## Git 인계

이 저장소의 `AGENTS.md`에 따라 add/commit/push/tag는 Cursor가 수행한다. 종료 시점에는 Conventional Commit 한국어 규칙과 최종 `pnpm verify` 결과를 함께 남긴다. 권장 종료 태그는 실제 release 상태를 확인한 뒤 Cursor가 결정하며, 미완료 QA를 숨기기 위해 선행 생성하지 않는다.

### Cursor 종료 릴리스 실행안

현재 기준 브랜치는 `main`, 원격은 `https://github.com/dayainow/goodz.git`, 직전 태그는 `v1.0.0`이다. 종료 릴리스 후보는 `v1.1.0`으로 한다.

1. 기존 사용자 변경인 `apps/process-dashboard/src/App.tsx`의 산출물 가독성 개선을 `fix: 산출물 문서 가독성 개선`으로 분리한다.
2. 종료·Beacon 인계 문서를 `docs: Goodz v1.1 종료와 Beacon 인계 정리`로 커밋한다.
3. `pnpm verify`를 다시 통과하고 `main`을 `origin`에 push한다.
4. [x] [dayainow/beacon-project-os](https://github.com/dayainow/beacon-project-os) 공개 빈 저장소를 생성한다. 이 단계에서는 Goodz 소스를 복사하지 않는다.
5. [x] 확정된 Beacon 원격 URL을 이 문서와 루트 README에 추가한다. 종료 문서 commit과 push는 2–3번에 포함한다.
6. annotated tag `v1.1.0`을 생성·push하고 GitHub Release를 발행한다.
7. Release와 README 링크를 확인한 뒤 Repository Closure Gate를 닫는다.

Release 제목은 `Goodz v1.1.0 — Installable Empty Workspace`를 사용한다. 본문에는 빈 Workspace, 선택적 Internal Reference, 독립 SQLite, CLI init/adopt, 전체 `pnpm verify`, Beacon 분리 결정을 요약한다.
