# Goodz Template Onboarding

Goodz를 새 제품 팀의 풀 프로세스 모노레포로 fork할 때 사용하는 시작 런북입니다. 목표는 **30분 안에 저장소 정체성을 바꾸고, 로컬 4앱을 기동하고, 첫 P0 입력을 등록하는 것**입니다.

## 준비 조건

- Node.js 20 이상
- Corepack으로 활성화한 pnpm 9.15.9
- GitHub 저장소 쓰기 권한
- 기본 web-shop 분석 연동을 설치할 수 있는 GitHub 네트워크

## 1. Fork와 최초 검증

```bash
git clone <your-repository-url>
cd <your-repository>
corepack enable
pnpm install --frozen-lockfile
pnpm verify
```

`pnpm verify`에는 workspace, dependency, Process OS, template contract, build, lint 검사가 포함됩니다. 실패한 검사를 해결하기 전에는 프로젝트 이름 변경이나 기능 개발을 시작하지 않습니다.

## 2. 정체성 바꾸기

아래 순서로 Goodz 예시 값을 새 제품 값으로 교체합니다.

| 순서 | 대상 | 바꿀 내용 |
|------|------|-----------|
| 1 | `docs/00-process/NORTH_STAR.md` | 제품 한 줄 정의, 만드는 것/만들지 않는 것 |
| 2 | `docs/01-planning/PRD.md` | 사용자, 문제, 범위, 성공 기준 |
| 3 | `package.json` | name, description, repository URL |
| 4 | `README.md`, `PROJECT.md` | 제품명, 저장소 링크, 현재 Sprint |
| 5 | `@goodz/*` workspace 이름 | 필요할 때만 조직 scope로 일괄 변경 |

패키지 scope를 바꿀 때는 `packages/types → api-server → packages/ui → apps` 순서로 import를 변경하고 `pnpm check:workspace`를 실행합니다.

## 3. 런타임 설정

```bash
cp apps/web-shop/.env.local.example apps/web-shop/.env.local
cp apps/admin-dashboard/.env.example apps/admin-dashboard/.env
cp apps/process-dashboard/.env.example apps/process-dashboard/.env
pnpm dev
```

| 앱 | 기본 URL | 역할 |
|----|----------|------|
| web-shop | `http://localhost:3000` | B2C 레퍼런스 |
| api-server | `http://localhost:4000` | REST + Process SSOT |
| admin-dashboard | `http://localhost:5173` | 운영 레퍼런스 |
| process-dashboard | `http://localhost:5180` | 프로세스 운영 UI |

포트를 바꾸면 env example, `docs/04-qa/STAGING_RUNBOOK.md`, `docs/00-process/status.json`의 `apps`를 함께 갱신합니다.

## 4. 첫 P0 사이클

1. `docs/01-planning/intake/`에 첫 요청을 작성합니다.
2. PRD, USER_STORIES, GA4_EVENTS를 새 제품 기준으로 고칩니다.
3. `docs/00-process/status.json`에 intake, deliverable, approval, trace link를 연결합니다.
4. `docs/00-process/PHASE_GATES.md`의 P0 기준을 확인합니다.
5. `pnpm check:process && pnpm check:template`을 실행합니다.

P0 Gate가 통과되기 전에는 P1/P2 산출물을 완료로 표시하지 않습니다.

## 5. 외부 연동

`ga-analytics-harness`는 기본 web-shop에 포함된 GA4 레퍼런스 연동이며 GitHub commit에 고정됩니다. 저장소 밖의 형제 폴더를 요구하지 않으므로 clean clone에서도 설치할 수 있습니다. 이 연동이 필요 없는 제품은 web-shop의 분석 코드와 dependency를 함께 제거합니다. 네트워크가 제한된 환경에서는 조직 내부 registry mirror로 바꾼 뒤 lockfile을 갱신합니다.

GitHub trace sync는 저장소를 바꾼 후 다음 환경 변수를 사용합니다.

```bash
GOODZ_GITHUB_REPO=<owner>/<repository> pnpm sync:github-trace
```

## 온보딩 완료 기준

- [ ] `pnpm install --frozen-lockfile` 성공
- [ ] `pnpm verify` 성공
- [ ] 4앱 로컬 기동과 기본 URL 확인
- [ ] North Star와 PRD가 새 제품 기준으로 변경됨
- [ ] 첫 intake와 DACI 승인 요청이 `status.json`에 연결됨
- [ ] GitHub CI가 새 저장소에서 green

기계 판독 계약은 루트의 `template.config.json`, 검증 구현은 `scripts/validate-template.mjs`가 SSOT입니다.
