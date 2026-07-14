# ADR-011 — Immutable Template Version Migration

## 상태

Accepted — 2026-07-14

## 배경

팀 프로세스가 바뀔 때 실행 중인 Template 정의를 덮어쓰면 과거 Run의 Task와 Gate 근거를 재현할 수 없다.

## 결정

- Template 변경은 원본을 수정하지 않고 `<lineage>-V<n+1>` ID를 만든다.
- Stage·Task·Deliverable을 새 version에 복제한다.
- 기존 Run의 `templateId`와 `templateVersion`은 변경하지 않는다.
- 새 프로젝트가 새 version을 명시적으로 선택한다.
- migration은 API와 `goodz template migrate`에서 같은 계약을 사용한다.

## 호환성

Core 계약을 0.7.0으로 올리되 기존 Template과 Run schema는 유지한다. SQLite schema 변경 없이 새 command와 audit event만 추가한다.
