# ADR 001: Turborepo + pnpm 모노레포

## 상태

Accepted

## 컨텍스트

굿즈 이커머스는 쇼핑몰·어드민·API를 공유 타입·UI로 묶어야 합니다.

## 결정

- **pnpm workspace** — 디스크 효율, workspace 프로토콜
- **Turborepo** — `^build` 캐시, 병렬 dev/build
- **Express** (Nest 대신) — MVP API 경량화

## 결과

- `@goodz/types` 단일 SSOT
- `pnpm dev` 한 번에 3앱 기동
- CI `pnpm verify`

## 대안

| 대안 | 기각 이유 |
|------|-----------|
| npm workspaces | pnpm 대비 링크·속도 |
| Nx | 학습곡선, MVP에 과함 |
| Nest.js | 보일러플레이트, mock API에 과함 |
