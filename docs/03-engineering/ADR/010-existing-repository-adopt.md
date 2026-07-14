# ADR-010 — Existing Repository Adopt

## 상태

Accepted — 2026-07-14

## 배경

`goodz init`은 빈 설정을 만들 수 있지만 이미 앱과 패키지가 있는 저장소의 실제 경계를 반영하지 못한다. 자동 수정 범위를 넓히면 기존 workspace와 애플리케이션을 훼손할 위험이 있다.

## 결정

- `goodz adopt`는 `package.json`, `apps/`, `packages/`, `references/`만 읽어 도입 계획을 만든다.
- 기본 실행은 파일을 쓰지 않는다.
- `--apply`에서만 `goodz.config.json`과 materialization 디렉터리를 생성한다.
- 기존 설정은 기본적으로 거부하고 `--force`를 명시한 경우에만 교체한다.
- 앱 코드, 의존성, workspace 설정은 변경하지 않는다.

## 결과

기존 제품 저장소는 Goodz Core를 도입하기 전에 감지 결과를 검토할 수 있다. 자동 탐지는 최종 아키텍처 결정이 아니라 안전한 설정 초안이며, 이후 `goodz verify`와 사람의 diff 검토가 Gate다.
