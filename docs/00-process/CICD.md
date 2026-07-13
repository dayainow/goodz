# CI/CD — 검증과 배포 증거

Goodz의 CI/CD는 단순히 빌드가 통과했는지 확인하는 장치가 아니라, **Process OS 산출물이 실제 코드와 연결됐는지 증명하는 증거 체계**입니다.

## 로컬 검증

PR 또는 main push 전에는 아래 명령을 기준으로 확인합니다.

```bash
pnpm verify
```

`pnpm verify` 구성:

| 단계 | 명령 | 역할 |
|------|------|------|
| Workspace | `pnpm check:workspace` | pnpm workspace 구조 검증 |
| Dependencies | `pnpm check:deps` | 유령 의존성 검증 |
| Process OS | `pnpm check:process` | `status.json`, 산출물 경로, trace link 검증 |
| Build | `turbo build` | 패키지와 앱 빌드 |
| Lint | `turbo lint` | TypeScript noEmit 기준 린트 |

GitHub 증거 동기화는 네트워크와 `gh` 인증이 필요하므로 `pnpm verify`에는 넣지 않습니다.

```bash
pnpm sync:github-trace
pnpm sync:github-trace:check
```

## GitHub Actions

워크플로우: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

트리거:

- `main`, `develop` push
- `main`, `develop` 대상 pull request

CI 단계:

1. `dayainow/goodz` checkout
2. `dayainow/ga-analytics-harness` 형제 checkout
3. pnpm + Node.js 24 설치
4. Turborepo cache 복원
5. workspace/dependency/process 검증
6. build + lint

### Actions Runtime

2026-07-13 기준 CI는 Node 24 런타임을 사용합니다.

| 액션 | 버전 |
|------|------|
| `actions/checkout` | `v7` |
| `pnpm/action-setup` | `v6` |
| `actions/setup-node` | `v6` |
| `actions/cache` | `v6` |

GitHub Actions의 Node 20 deprecation 경고를 피하기 위해 workflow와 setup-node 런타임을 함께 갱신합니다.

## Smoke 검증

로컬 또는 스테이징 URL 확인:

```bash
pnpm smoke:staging
```

환경별 URL override:

```bash
GOODZ_API_URL=https://api.example.com \
GOODZ_WEB_URL=https://shop.example.com \
GOODZ_ADMIN_URL=https://admin.example.com \
GOODZ_PROCESS_URL=https://process.example.com \
pnpm smoke:staging
```

Smoke 기준:

- API health
- 상품 API
- Process status API
- `deliverables`, `planningChanges`, `approvals`, `traceLinks` 존재
- web-shop, admin-dashboard, process-dashboard HTML 응답

## Traceability 반영 규칙

CI가 성공하면 `docs/00-process/status.json`의 `traceLinks`에 아래 증거를 연결합니다.

| 필드 | 예시 |
|------|------|
| `commits[].sha` | `279b609` |
| `commits[].url` | `https://github.com/dayainow/goodz/commit/279b609` |
| `ciRuns[].id` | `29077762295` |
| `ciRuns[].url` | `https://github.com/dayainow/goodz/actions/runs/29077762295` |
| `smoke.status` | `passed` |
| `smoke.command` | `pnpm smoke:staging` |

Issue/PR 없이 직접 main에 반영한 개인 프로젝트 작업은 `pr.status = "not_required"`로 남깁니다.  
실제 팀 운영에서는 Issue와 PR을 먼저 만들고 `traceLinks`에 URL을 연결합니다.

## Release/Smoke Evidence

릴리즈 증거는 두 방식 중 하나를 연결합니다.

| 방식 | 기록 위치 |
|------|-----------|
| GitHub Release 또는 외부 배포 URL | `traceLinks[].release.url` |
| 스테이징/프로덕션 smoke pass | `traceLinks[].smoke` |

외부 배포 URL이 있으면 다음처럼 동기화합니다.

```bash
GOODZ_RELEASE_URL=https://example.com/releases/goodz-v0.6 pnpm sync:github-trace
```

## 실패 시 처리

| 실패 | 확인 |
|------|------|
| `check:process` 실패 | 누락 문서, 잘못된 ID 참조, linked 상태인데 commit/CI 없음 |
| `check:deps` 실패 | 앱 또는 패키지의 명시 의존성 누락 |
| build 실패 | 타입, import, Vite/Next 빌드 오류 |
| smoke 실패 | 서버 미기동, URL override 오류, API 응답 스키마 변경 |
| trace sync 실패 | `gh auth status`, repo 권한, 커밋 SHA 존재 여부 |
