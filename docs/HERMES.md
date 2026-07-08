# Goodz × Hermes Agent 워크플로우

[Hermes Agent](https://github.com/NousResearch/hermes-agent)는 [Nous Research](https://nousresearch.com)의 오픈소스 자율 AI 에이전트입니다. CLI·게이트웨이(Telegram/Discord/Slack 등)·지속 메모리·[agentskills.io](https://agentskills.io) 호환 스킬을 지원합니다.

공식 문서: [hermes-agent.org/ko](https://hermes-agent.org/ko/)

---

## 왜 Goodz와 함께 쓰나

| Hermes 기능 | Goodz에서 활용 |
|-------------|----------------|
| **지속 메모리** | 굿즈 카테고리·API 규칙·진행 중 피처 기억 |
| **스킬 시스템** | `skills/goodz-dev/SKILL.md` — 모노레포 규칙 자동 적용 |
| **서브 에이전트** | web-shop / api / admin 병렬 작업 |
| **cron** | 야간 `pnpm verify`, 주간 의존성 감사 |
| **게이트웨이** | 이동 중 Telegram으로 "상품 API 스펙 추가해줘" |

Cursor와 **병행** 가능합니다. Cursor는 IDE 내 편집, Hermes는 서버 상시 실행·메시징 채널에 적합합니다.

---

## 1. Hermes 설치

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
source ~/.zshrc   # 또는 ~/.bashrc
hermes setup
hermes model      # Nous Portal / OpenRouter / 커스텀 API
```

## 2. Goodz 프로젝트 연결

```bash
cd /path/to/goodz

# Goodz 개발 스킬 등록 (symlink 예시)
mkdir -p ~/.hermes/skills
ln -sf "$(pwd)/skills/goodz-dev" ~/.hermes/skills/goodz-dev

# Hermes에게 프로젝트 컨텍스트 주입
hermes
```

첫 메시지 예시:

```text
이제부터 /path/to/goodz 모노레포에서 작업해.
AGENTS.md와 skills/goodz-dev/SKILL.md를 읽고 따르고,
변경 후에는 pnpm verify를 실행해.
```

## 3. 개발 루프 (Hermes + Goodz)

```text
① Hermes에게 기능 요청 (자연어)
    │
    ▼
② packages/types 타입 추가
    │
    ▼
③ api-server 엔드포인트
    │
    ▼
④ web-shop / admin UI
    │
    ▼
⑤ pnpm verify (build + lint)
    │
    ▼
⑥ Hermes 메모리에 완료 기록
```

## 4. 게이트웨이 (선택)

Telegram 등에서 원격 지시:

```bash
hermes gateway setup
hermes gateway
# 또는 systemd: hermes gateway install
```

## 5. 예약 작업 (cron) 예시

Hermes 내장 cron으로 품질 게이트:

| 스케줄 | 작업 |
|--------|------|
| 매일 09:00 | `cd goodz && pnpm verify` 결과 Telegram 전송 |
| 매주 월요일 | `pnpm outdated` 요약 |

## 6. Cursor와 역할 분담

| 도구 | 역할 |
|------|------|
| **Cursor** | IDE 내 코드 편집, MCP(Notion/Figma), 인라인 리뷰 |
| **Hermes** | 24/7 서버 에이전트, 메시징, 메모리, cron, 서브에이전트 |

공통 규칙은 `AGENTS.md` + `skills/goodz-dev/SKILL.md`로 **단일 진실 공급원** 유지.

---

## 트러블슈팅

| 증상 | 확인 |
|------|------|
| Hermes가 npm 사용 | `AGENTS.md` 다시 주입, pnpm만 사용 지시 |
| 빌드 실패 | `api-server` 실행 여부, `@goodz/types` build |
| 스킬 미적용 | `~/.hermes/skills/goodz-dev` symlink 확인 |
