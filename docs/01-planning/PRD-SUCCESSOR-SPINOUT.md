# Beacon 제품 분리 PRD

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-07-15 |
| 상태 | Approved — 저장소 분리 및 기능 동결 |
| 제품명 | Beacon (비콘) |
| 작업명 | Beacon Spin-out |
| 원본 | Goodz v1.1 종료 기준선 |
| 저장소 | [dayainow/beacon-project-os](https://github.com/dayainow/beacon-project-os) |

> **한 줄 정의:** Beacon은 프로젝트 폴더에서 시작해 현재 방향, 부족한 부분, 산출물과 변경 이력을 보여주는 로컬 우선 Project Navigation OS다.

## 1. 문제

Goodz는 풀프로세스 모델, Gate, 산출물, Evidence, CLI와 Dashboard를 한 저장소에서 검증했다. 검증 범위가 넓어지면서 사용자 프로젝트 운영 기능과 Goodz 자체 개발 기록, Commerce Reference, Internal Service Reference, 설치·배포·지표 기능이 같은 제품 표면과 런타임에 누적됐다.

Beacon은 별도 서비스 안에서 프로젝트를 다시 등록하는 방식이 아니라, **실제 프로젝트 폴더에 설치해 그 폴더의 정체성·프로세스·산출물·변경 이력을 읽고 관리하는 로컬 우선 Project Navigation OS**여야 한다.

## 2. 목표

- 프로젝트 폴더 하나를 프로젝트 하나로 취급한다.
- `beacon init` 또는 `beacon adopt` 후 `beacon open`으로 로컬 Dashboard를 연다.
- 파일, Git과 프로세스 상태를 자동으로 읽고 출처와 함께 표시한다.
- 부족한 산출물과 끊어진 연결을 사람이 이해할 수 있는 신호로 설명한다.
- 작업 이력을 프로젝트 종료 시 Project Book으로 내보낼 수 있게 축적한다.
- Goodz에서 검증된 최소 계약만 선별 이식해 초기 복잡도를 제한한다.

## 3. 첫 번째 세로 흐름

```text
임의의 프로젝트 폴더
→ beacon init/adopt
→ beacon open
→ 프로젝트 정체성 표시
→ 파일·Git 탐색 결과 표시
→ 부족한 항목 표시
```

## 4. MVP 범위

### 포함

- 단일 로컬 프로젝트 폴더
- Project Identity
- P0–P4 Process Run과 Gate
- 로컬 파일·Git 스캐너
- 산출물 목록과 출처
- 설명 가능한 Project Health 신호
- 의미 단위 Timeline
- 프로젝트 전용 SQLite
- 개요·프로세스·산출물·히스토리·설정의 최대 5개 기본 메뉴

### 비목표

- 여러 프로젝트 Portfolio
- 조직·계정·RBAC와 Cloud 동기화
- Commerce 또는 다른 도메인 Reference 번들
- Template Builder
- DORA 상세 지표와 Incident 운영
- 자동 Git branch·push·Pull Request
- 모든 외부 서비스 Connector
- AI 자동 판단과 Gate 자동 승인
- 기존 Goodz Dashboard 전체 이식

### 이름과 항해 메타포

- **Beacon**은 프로젝트가 나아갈 방향과 다음 행동을 알려주는 제품 역할을 뜻한다.
- 프로젝트 전체는 하나의 여정이고, 완료 시 남는 기록은 Project Book이다.
- 항해 메타포는 브랜드 설명에 사용하되 메뉴와 작업 용어는 개요, 단계, 산출물, 문제, 히스토리처럼 직관적인 한국어를 유지한다.

## 5. 제품 원칙

1. 프로젝트 원본은 사용자 프로젝트 폴더가 소유한다.
2. `.beacon/`의 파생 인덱스는 삭제 후 재생성할 수 있어야 한다.
3. 자동 발견을 기본으로 하고 수동 입력은 수정·예외 처리로 제한한다.
4. 모든 건강 신호는 근거, 출처와 다음 행동을 제공한다.
5. 로컬 제품은 단일 프로젝트에 집중하고 Portfolio는 후속 Cloud 범위로 둔다.
6. 새 계약과 테스트를 먼저 작성하고 필요한 기존 코드만 이식한다.

## 6. 성공 기준

- 깨끗한 외부 저장소에서 2분 안에 `beacon init → beacon open`이 가능하다.
- Goodz 소스 checkout, Commerce 앱과 내부 Reference 없이 실행된다.
- 첫 화면에 샘플 데이터가 아닌 현재 폴더의 이름과 탐색 결과가 표시된다.
- 로컬 문서와 Git commit은 수동 Evidence 재등록 없이 나타난다.
- 기본 사용자는 API URL, Project ID, Operations DB를 직접 다루지 않는다.
- 기본 메뉴가 5개를 넘지 않는다.

## 7. 전환 정책

- Goodz 저장소는 v1.1 검증 기준선으로 기능 동결한다.
- Beacon은 새 Git 이력과 별도 저장소에서 시작한다.
- 이식 대상은 [TRANSFER_MANIFEST](../00-process/TRANSFER_MANIFEST.md)에서 승인한다.
- 전체 폴더 복사나 기존 Dashboard 복제를 금지한다.
- 원본 Goodz 버전과 출처는 새 저장소의 첫 ADR에 기록한다.

## 8. Gate

Beacon 저장소의 소스 이식과 첫 commit 전 [Repository Closure Gate](../00-process/PHASE_GATES.md#repository-closure-gate)를 통과한다. 새 제품의 P0 Gate는 이름, 한 줄 정의, 정보 구조, 첫 세로 흐름 AC와 비목표 확정으로 구성한다.
