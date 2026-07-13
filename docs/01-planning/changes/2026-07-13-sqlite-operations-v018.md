# SQLite Operations v0.18 변경

- Change ID: CR-017
- 연결 입력: IN-017
- 상태: implemented
- 변경일: 2026-07-13

## 변경 내용

1. `@goodz/types`에 운영 사건과 운영 개요 타입을 추가했다.
2. API 서버에 SQLite schema migration, 문서 인덱스 seed, 사건 생성·종료 API를 추가했다.
3. Process Dashboard에 운영 DB 메뉴와 사건 타임라인을 추가했다.
4. Process Dashboard 정적 빌드를 API 서버가 제공하도록 구성했다.
5. Render 영구 디스크 Blueprint와 SQLite 검증 명령을 추가했다.

## 검증

- `pnpm check:sqlite`
- `pnpm verify`
- 단일 서비스 `/health`, `/api/process/status`, `/api/process/operations`, `/` 스모크
