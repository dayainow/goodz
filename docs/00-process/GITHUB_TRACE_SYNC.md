# GitHub Trace Sync

Goodz v0.6부터 `traceLinks`의 GitHub 증거는 가능한 한 `gh` CLI로 동기화합니다.  
수동 입력은 예외 처리이고, 기본 운영은 `status.json`을 자동 보강하는 방식입니다.

## 명령

```bash
pnpm sync:github-trace
```

쓰기 없이 확인만 할 때:

```bash
pnpm sync:github-trace:check
```

## 수집하는 증거

| 증거 | 기준 |
|------|------|
| Commit | `traceLinks[].commits[].sha`에 이미 기록된 SHA |
| CI run | `gh api /repos/dayainow/goodz/actions/runs?head_sha=<sha>` |
| PR | `gh api /repos/dayainow/goodz/commits/<sha>/pulls` |
| Issue | PR 제목/본문의 `#N`, `Closes #N`, `Fixes #N` 등 |
| Release | `GOODZ_RELEASE_URL` 또는 GitHub latest release |

## 운영 규칙

1. 새 작업은 먼저 intake/change/deliverable/approval/trace link를 만든다.
2. 커밋 후 `traceLinks[].commits`에 최소 SHA와 메시지를 기록한다.
3. CI가 끝나면 `pnpm sync:github-trace`를 실행한다.
4. 스크립트가 CI run, PR, Issue, Release URL을 보강한다.
5. `pnpm check:process`와 `pnpm verify`로 SSOT 정합성을 확인한다.

직접 `main`에 반영한 1인 프로젝트 작업은 `pr.status = "not_required"`로 둡니다. 팀 운영에서는 Issue와 PR을 먼저 만들고, PR 본문에 `Closes #N`을 남기는 것을 기본으로 합니다.

## 릴리즈 URL

GitHub Release가 없거나 외부 배포 URL을 쓰는 경우:

```bash
GOODZ_RELEASE_URL=https://example.com/releases/goodz-v0.6 pnpm sync:github-trace
```

## 한계

- 커밋 SHA가 없는 trace link는 자동으로 추적할 수 없습니다.
- Issue 자동 연결은 PR 제목/본문에 이슈 번호가 있어야 안정적입니다.
- smoke 결과는 네트워크 상태와 배포 환경을 확인해야 하므로 `traceLinks[].smoke`에 별도 기록합니다.
