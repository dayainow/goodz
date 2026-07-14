# CR-025 — Git Materializer & Goodz CLI v0.26

| 항목 | 내용 |
|---|---|
| 요청일 | 2026-07-14 |
| 상태 | applied |
| 승인 | AP-025 |

## 변경

- 설치 가능한 `@goodz/cli` workspace package를 추가한다.
- Process API를 사용하는 project create와 export client를 제공한다.
- 승인 bundle을 Markdown 3건과 `.goodz/exports` hash manifest로 materialize한다.
- 경로 제한, symlink 차단, 원자적 쓰기와 로컬 수정 충돌 보호를 적용한다.
- init/verify로 기존 저장소 도입과 export 무결성을 검증한다.
- CLI 테스트를 루트 `pnpm verify`에 포함한다.

## 결정

v0.26은 파일 생성까지만 책임지고 Git commit/push는 수행하지 않는다. 자동 Git 조작은 인증·branch 정책·PR 승인 모델을 가진 별도 Connector로 확장한다.
