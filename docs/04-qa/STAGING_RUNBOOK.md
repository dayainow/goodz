# Goodz 스테이징 런북

Goodz P4 기준은 외부 호스팅 연결 전에도 반복 가능한 release-ready 절차를 저장소 안에 남기고, Process OS는 SQLite 영구 디스크 구성까지 검증하는 것입니다.

## 환경 변수

| 앱 | 변수 | 예시 |
|----|------|------|
| web-shop | `NEXT_PUBLIC_API_URL` | `https://goodz-api-staging.example.com` |
| admin-dashboard | `VITE_API_URL` | `https://goodz-api-staging.example.com` |
| process-dashboard | `VITE_API_URL` | `https://goodz-api-staging.example.com` |
| api-server | `PORT` | `4000` |
| api-server | `GOODZ_DB_PATH` | `/var/data/goodz.db` |
| api-server | `GOODZ_DB_DURABILITY` | `persistent` |
| api-server | `GOODZ_BASIC_AUTH_USER` | Render secret 입력 |
| api-server | `GOODZ_BASIC_AUTH_PASSWORD` | Render secret 입력 |

## Process OS 단일 서비스 배포

`render.yaml`은 Process Dashboard를 빌드한 뒤 API 서버가 정적 파일과 API를 같은 origin에서 제공하도록 정의합니다.

1. GitHub 저장소의 Render Blueprint를 적용합니다.
2. Basic Auth 사용자명·비밀번호를 secret으로 입력하고, `goodz-process-os` 서비스가 `starter` 플랜과 1GB `/var/data` disk를 사용하는지 확인합니다.
3. 배포 후 `/health`와 `/api/process/operations`를 확인합니다.
4. `storage.engine`이 `sqlite`, `storage.durability`가 `persistent`인지 확인합니다.
5. incident 하나를 생성·종료하고 재배포 뒤에도 남는지 확인합니다.

배포 URL의 기본 스모크는 다음 명령으로 실행합니다.

```bash
GOODZ_PROCESS_OS_URL=https://your-service.onrender.com \
GOODZ_PROCESS_OS_USER=your-user \
GOODZ_PROCESS_OS_PASSWORD=your-password \
pnpm smoke:process-os
```

영구 디스크는 유료 리소스입니다. 계정 소유자의 비용 승인 없이 Blueprint를 실제 적용하지 않습니다.

## 무료 프리뷰 배포

외부 URL과 주요 Process command를 비용 없이 확인할 때는 `render.free.yaml`을 사용합니다. 운영용 `render.yaml`을 수정하거나 disk 설정을 제거하지 않습니다.

1. Render Dashboard에서 **New → Blueprint**를 선택합니다.
2. GitHub 저장소 `dayainow/goodz`와 `main` 브랜치를 연결합니다.
3. Blueprint Path에 `render.free.yaml`을 입력합니다.
4. Preview에서 `goodz-process-os-preview`, `free`, `singapore`, disk 없음인지 확인합니다.
5. `GOODZ_BASIC_AUTH_USER`, `GOODZ_BASIC_AUTH_PASSWORD`를 입력하고 Blueprint를 적용합니다.
6. 서비스가 Live가 되면 생성된 `https://...onrender.com` URL로 아래 smoke를 실행합니다.

비밀번호 없이 공개 health와 인증 경계만 확인합니다.

```bash
pnpm smoke:render-preview
```

```bash
GOODZ_PROCESS_OS_URL=https://your-preview.onrender.com \
GOODZ_PROCESS_OS_USER=your-user \
GOODZ_PROCESS_OS_PASSWORD=your-password \
pnpm smoke:process-os
```

무료 프리뷰의 `GOODZ_DB_PATH`는 `/tmp/goodz.db`, `GOODZ_DB_DURABILITY`는 `local`입니다. Dashboard·API·SQLite schema·Template/Project 화면은 확인할 수 있지만, 인스턴스 절전·재시작·재배포 후 데이터 보존은 합격 기준에서 제외합니다. 최초 요청은 인스턴스 기동 때문에 늦을 수 있습니다.

Render Node runtime이 제공하는 `pnpm`을 그대로 사용합니다. build command에 `corepack enable`을 추가하면 읽기 전용 `/usr/bin/pnpm`을 교체하려다 `EROFS`로 실패할 수 있습니다.

현재 무료 프리뷰 URL은 `https://goodz-process-os-preview.onrender.com`입니다. 2026-07-14에 `/health` 200, Dashboard/API 401 Basic challenge와 인증 후 Dashboard 렌더링을 확인했습니다.

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
- API `/api/process/operations` storage engine이 `sqlite`
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
