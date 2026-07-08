# ADR 001: Turborepo + pnpm 모노레포

## 상태

Accepted

## 컨텍스트

굿즈 이커머스는 쇼핑몰·어드민·API를 공유 타입·UI로 묶어야 합니다.

## 결정

- **pnpm workspace** — `node-linker=isolated`, 유령 의존성 차단, workspace 프로토콜
- **Turborepo** — `^build` 태스크 그래프 + computational cache (로컬·CI `.turbo/cache`)
- **Express** (Nest 대신) — MVP API 경량화

## 검증

- `manypkg check` — 워크스페이스 의존성 일관성
- `check:deps` (depcheck) — 미선언 import 탐지
- `pnpm verify` — 위 검사 + `turbo build` + `turbo lint`

## 결과

- `@goodz/types` 단일 SSOT
- `pnpm dev` 한 번에 3앱 기동
- CI: pnpm 캐시 + Turborepo `.turbo/cache` 복원으로 빌드 스킵

## 대안

| 대안 | 기각 이유 |
|------|-----------|
| npm workspaces | pnpm 대비 링크·속도 |
| Nx | 학습곡선, MVP에 과함 |
| Nest.js | 보일러플레이트, mock API에 과함 |
