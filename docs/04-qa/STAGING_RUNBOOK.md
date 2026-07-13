# Goodz 스테이징 런북

Goodz v0.2의 P4 기준은 **외부 호스팅 연결 전에도 반복 가능한 release-ready 절차**를 저장소 안에 남기는 것입니다.

## 환경 변수

| 앱 | 변수 | 예시 |
|----|------|------|
| web-shop | `NEXT_PUBLIC_API_URL` | `https://goodz-api-staging.example.com` |
| admin-dashboard | `VITE_API_URL` | `https://goodz-api-staging.example.com` |
| process-dashboard | `VITE_API_URL` | `https://goodz-api-staging.example.com` |
| api-server | `PORT` | `4000` |

## 배포 순서

1. `api-server`를 먼저 배포하고 `/health`가 `{ "ok": true }`를 반환하는지 확인합니다.
2. `web-shop`, `admin-dashboard`, `process-dashboard`에 API URL 환경 변수를 설정합니다.
3. 세 프런트 앱을 배포합니다.
4. 아래 smoke 명령으로 API와 화면 응답을 확인합니다.

```bash
GOODZ_API_URL=https://goodz-api-staging.example.com \
GOODZ_WEB_URL=https://goodz-web-staging.example.com \
GOODZ_ADMIN_URL=https://goodz-admin-staging.example.com \
GOODZ_PROCESS_URL=https://goodz-process-staging.example.com \
pnpm smoke:staging
```

로컬 기본값은 `localhost` 포트입니다.

```bash
pnpm smoke:staging
```

## Smoke 기준

- API `/health` 응답이 `ok: true`
- API `/api/products` 상품 1개 이상
- API `/api/process/status` phase 1개 이상
- web-shop, admin-dashboard, process-dashboard HTML 응답이 비어 있지 않음

## Trace Evidence 기록

Smoke가 통과하면 관련 `traceLinks`에 아래 형식으로 기록합니다.

```json
{
  "smoke": {
    "status": "passed",
    "command": "pnpm smoke:staging",
    "checkedAt": "2026-07-13",
    "summary": "API, web, admin, process dashboard smoke passed"
  }
}
```

외부 배포 URL이 있으면 `release.url` 또는 `GOODZ_RELEASE_URL`을 통해 함께 연결합니다.

## 롤백

외부 호스팅에서 문제 발생 시 이전 성공 SHA로 재배포합니다.

- 기준 SHA: GitHub Actions가 green인 마지막 커밋
- 현재 v0.2 기준: GitHub Actions가 green인 마지막 `main` 커밋
- 실패 시 `RELEASE_CHECKLIST.md`에 실패 URL, 실패 명령, 롤백 SHA를 기록합니다.
