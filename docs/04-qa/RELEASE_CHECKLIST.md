# Goodz 릴리스 체크리스트

## 스테이징 배포 전

- [x] `pnpm verify` 로컬 pass
- [x] GitHub Actions CI green
- [x] PRD MVP AC 반영 여부 확인
- [x] env 변수 스테이징 설정 기준 문서화 (`NEXT_PUBLIC_API_URL`, `VITE_API_URL`)
- [x] API health check
- [x] 스테이징 smoke 명령 준비 (`pnpm smoke:staging`)
- [x] Release/Smoke evidence 기록 규칙 (`traceLinks[].release`, `traceLinks[].smoke`)

### 2026-07-10 확인 메모

- 로컬 `pnpm verify` pass
- 로컬 `pnpm smoke:staging` pass (`/health`, `/api/products`, `/api/process/status`, web/admin/process HTML)
- 로컬 API health: `GET /health` → `{ "ok": true }`
- GitHub Actions: `d64b691` / run `29070789760` success (verify 1m11s)
- 스테이징 런북: [STAGING_RUNBOOK.md](./STAGING_RUNBOOK.md)
- 스테이징 env 후보:
  - `NEXT_PUBLIC_API_URL`
  - `VITE_API_URL`

## 프로덕션 배포 전

- [x] 스테이징 TC-001~003 pass 기준 정의
- [x] 롤백 plan (이전 green SHA 재배포)
- [x] GA4 이벤트 스테이징 검증 기준 정의 (`test:analytics`, `analytics:compliance`)
- [x] v0.2 범위 freeze

## 배포 후

- [x] 프로덕션 smoke test 명령 문서화 (`pnpm smoke:staging` + production URL)
- [x] `PROJECT.md` Phase 상태 갱신
- [x] 회고 메모: v0.2는 외부 호스팅 연결 전 release-ready 기준으로 완료
- [x] GitHub trace sync 명령 문서화 (`pnpm sync:github-trace`)
