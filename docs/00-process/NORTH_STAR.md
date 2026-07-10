# North Star — Goodz가 만드는 것

> **모든 작업·문서·코드는 이 문서를 기준으로 판단합니다.**  
> Cursor · Claude Code · Hermes — 세션 시작 시 **반드시 읽을 것.**

---

## 한 줄 정의

**Goodz는 굿즈 쇼핑몰이 아닙니다.**  
**기획 → 디자인 → 개발 → QA → 배포**를 문서·게이트·모노레포·CI·AI 스킬로 묶은 **풀 프로세스 모노레포 시스템**입니다.

쇼핑몰(`web-shop` · `admin` · `api`)은 이 시스템이 **잘 돌아가는지 증명하는 레퍼런스 구현체**일 뿐입니다.

---

## 원하는 최종 아웃풋 (진짜 제품)

| 레이어 | 산출물 | 위치 |
|--------|--------|------|
| **프로세스** | P0–P4 워크플로, Phase Gate, Sprint 로드맵 | `docs/00-process/` |
| **기획 템플릿** | PRD, 유저스토리, GA4 명세 | `docs/01-planning/` |
| **디자인 파이프라인** | Claude Design handoff, 화면 스펙, DS 매핑 | `docs/02-design/` |
| **엔지니어링 표준** | 아키텍처, API SSOT, ADR | `docs/03-engineering/` |
| **품질 게이트** | TEST_PLAN, RELEASE_CHECKLIST, `pnpm verify`, CI | `docs/04-qa/`, `.github/` |
| **모노레포 뼈대** | Turborepo + pnpm, `@goodz/types` SSOT, **4앱** 구조 | `apps/`, `packages/`, `turbo.json` |
| **AI 협업 키트** | Phase별 스킬, `AGENTS.md`, 에이전트 역할 분리 | `skills/`, `AGENTS.md` |
| **연동 패턴** | GA harness, (선택) Figma publish | 외부 repo + 문서 |

**이 조합이 곧 판매·라이선스·템플릿화 가능한 “시스템”입니다.**

---

## 레퍼런스 도메인 (쇼핑몰)

| 항목 | 역할 |
|------|------|
| `apps/web-shop` | B2C UX · GA4 퍼널 데모 |
| `apps/admin-dashboard` | 운영 UI 데모 |
| `apps/process-dashboard` | **풀 프로세스 진행도 모니터링** (시스템 제품 UI) |
| `packages/types` | 도메인 SSOT 패턴 시연 |

도메인 기능(장바구니, 결제 mock 등)은 **시스템을 설명하기 위한 예시**입니다.  
새 기능을 넣을 때 먼저 물을 것:

> “이 변경이 **풀 프로세스 시스템**을 더 재현 가능하게 만드는가?”

---

## 작업 판단 체크리스트 (에이전트용)

작업 착수 전:

1. [ ] `NORTH_STAR.md`(이 문서)와 `PROJECT.md` 현재 Phase 확인
2. [ ] 요청이 **시스템 강화**인지 **데모 기능만**인지 구분
3. [ ] 해당 Phase 산출물·Gate에 맞는 **문서**를 함께 갱신할 것인지 결정
4. [ ] `pnpm verify` / CI에 영향 있는지 확인

작업 완료 전:

1. [ ] 코드만이 아니라 **프로세스 문서**도 필요 시 갱신했는가?
2. [ ] `WORKFLOW.md` · `PHASE_GATES.md` · `ROADMAP.md`와 모순 없는가?
3. [ ] 다른 에이전트가 따라 할 수 있게 **가이드**에 남겼는가?

### 우선순위 (충돌 시)

```text
시스템·문서·게이트·CI  >  레퍼런스 앱 기능 polish  >  데모 전용 편의
```

---

## 시스템 성숙도 (로드맵 관점)

| 단계 | 목표 |
|------|------|
| **v0.1** ✅ | 모노레포 + MVP 데모 + P0 Gate + CI |
| **v0.2** 🟡 | P1 디자인 파이프라인(Claude Design) + 확장 화면 스펙 |
| **v0.3** ⚪ | P3 QA 시나리오 + GA compliance 게이트 문서화 |
| **v1.0** ⚪ | “템플릿으로 fork 가능” — 온보딩 가이드 + 시스템 패키지화 |

상세: [ROADMAP.md](../01-planning/ROADMAP.md)

---

## 필수 참조 문서 (읽는 순서)

```text
1. NORTH_STAR.md          ← 지금 (왜 하는지)
2. PROJECT.md             ← 지금 어디인지
3. docs/00-process/AGENT_GUIDE.md  ← 어떻게 일하는지
4. AGENTS.md / CLAUDE.md  ← 도구별 규칙
5. Phase 해당 스킬        ← skills/goodz-{planning,design,dev}/
```

---

## 금지 (시스템 관점)

- 쇼핑몰 기능만 키우고 **프로세스 문서·Gate를 갱신하지 않기**
- 레퍼런스 앱에만 타입·UI를 두고 `@goodz/types` / `@goodz/ui` SSOT 깨기
- Phase를 건너뛰고 “일단 코드만” merge
- 에이전트가 git을 동시에 건드려 **작업 환경 혼선** 만들기 (→ `AGENTS.md` 다중 에이전트 규칙)

---

## 관련 링크

- [AGENT_GUIDE.md](./AGENT_GUIDE.md) — 에이전트 작업 절차
- [WORKFLOW.md](./WORKFLOW.md) — 풀 프로세스 상세
- [PHASE_GATES.md](./PHASE_GATES.md) — 단계 전환 기준
- [README.md](../../README.md) — 대외 소개
