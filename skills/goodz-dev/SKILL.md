---
name: goodz-dev
description: |
  Goodz 굿즈 이커머스 Turborepo(pnpm) 개발 스킬.
  "goodz", "굿즈", "web-shop", "admin-dashboard", "api-server", "@goodz/types", "@goodz/ui",
  "모노레포", "pnpm dev", "Product 타입" 키워드 시 이 스킬을 따른다.
  Hermes Agent 또는 Cursor에서 Goodz 저장소 작업 시 적용.
---

# Goodz Dev Skill

Goodz 모노레포에서 기능을 추가·수정할 때의 표준 워크플로우입니다.

## 1. 작업 시작

```bash
cd <goodz-root>
pnpm install
pnpm dev          # 또는 변경 범위에 맞게 개별 앱
```

Hermes CLI에서 이 저장소를 작업 디렉터리로 지정하세요.

## 2. 기능 추가 순서 (타입 우선)

| 단계 | 위치 | 예시 |
|------|------|------|
| ① 타입 | `packages/types/src/index.ts` | `Cart`, `CartItem` |
| ② API | `apps/api-server/src/` | `GET /api/cart` |
| ③ UI 패키지 | `packages/ui/src/` | 공통 컴포넌트 |
| ④ 쇼핑몰 | `apps/web-shop/src/` | 고객 화면 |
| ⑤ 어드민 | `apps/admin-dashboard/src/` | 관리 화면 |

## 3. 검증 (완료 보고 전 필수)

```bash
pnpm verify       # build + lint (turbo 캐시 활용)
```

개별 확인:

```bash
curl http://localhost:4000/api/products
pnpm --filter @goodz/web-shop dev
```

## 4. Turborepo

- 빌드: `dependsOn: ["^build"]` — 패키지 먼저, 앱 나중
- 변경 후 `pnpm build`로 캐시 hit 여부 확인
- `packages/types`, `packages/ui` 수정 시 반드시 해당 패키지 rebuild

## 5. 자주 하는 실수

| 실수 | 해결 |
|------|------|
| web-shop 빈 화면 | api-server `:4000` 실행 여부 |
| Tailwind 클래스 안 먹음 | 앱 tailwind `content`에 `packages/ui` 경로 |
| 타입 불일치 | `@goodz/types`만 SSOT로 사용 |
| npm install | 루트에서 `pnpm install` |
| git status가 계속 변함 | 다른 에이전트(Claude Code 등) 동시 작업 의심 → `AGENTS.md` 다중 에이전트 규칙 |

## 5-1. 다중 에이전트 (동시 작업)

- **git 커밋·푸시는 Cursor가 단일 창구.** Claude Code(Claude Design)는 파일 생성만, git은 건드리지 않음.
- 예상치 못한 변경 발견 시 파괴적 git 명령 전에 동시 작업 여부부터 확인.
- 자세한 규칙: `AGENTS.md` → "다중 에이전트 협업".

## 6. Hermes 연동

- 설치: [hermes-agent.org/ko](https://hermes-agent.org/ko/)
- 게이트웨이로 Telegram 등에서 "Goodz api에 주문 API 추가해줘" 요청 가능
- 이 스킬을 Hermes에 등록:

```bash
# 프로젝트 skills 폴더를 Hermes가 읽도록 symlink (예시)
ln -sf "$(pwd)/skills/goodz-dev" ~/.hermes/skills/goodz-dev
```

- 프로젝트 루트 `AGENTS.md`를 세션 시작 시 컨텍스트로 읽도록 지시

## 7. 참고 파일

- `AGENTS.md` — 에이전트 규칙 요약
- `docs/HERMES.md` — Hermes 설치·게이트웨이·cron 예시
- `README.md` — 사람용 빠른 시작
