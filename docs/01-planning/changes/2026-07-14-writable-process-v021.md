# Writable Process MVP v0.21 변경

## 결정

기존 Git 문서 SSOT는 유지하고, 사용자가 반복적으로 변경하는 프로젝트 실행 상태는 SQLite와 Process API가 책임진다.

## 변경 내용

1. `@goodz/process`에 Template, Project, Run, Stage, Task, Gate, Audit 계약을 추가했다.
2. SQLite schema v2에 기본 P0–P4 템플릿과 실행·감사 테이블을 추가했다.
3. 프로젝트 생성, 단계·작업 변경, GO/HOLD/KILL API를 추가했다.
4. Dashboard에 프로젝트 생성과 실행 관리 화면을 추가했다.
5. GO는 작업 완료를 검증하고 다음 단계를 자동 시작한다.
6. lifecycle 검증을 `pnpm check:sqlite`에 포함했다.

## 다음 단계

- Phase 0–8 서비스 프로세스를 두 번째 Template로 등록
- 산출물·증거 제출 command 추가
- Template Builder와 역할·권한 모델 설계
