# Process Dashboard 리디자인 PRD

| 항목 | 내용 |
|------|------|
| 제품명 | Goodz Process Dashboard (`apps/process-dashboard`) |
| 문서 버전 | v1.0 (디자인 리셋 기준) |
| 적용 기준 | Process OS v0.18/S20 이후 |
| 상태 | **Approved** — 2026-07-13 사용자 전달·승인 |
| 영향 범위 | `apps/process-dashboard`와 동반 Process OS 문서. API 데이터 계약은 유지 |
| 연동 스킬 | `goodz-dev`, `goodz-design` |
| 관련 문서 | `docs/00-process/USER_MANUAL.md`, `docs/00-process/NORTH_STAR.md`, `docs/03-engineering/API.md`, `apps/process-dashboard/src/App.tsx` |

---

## 1. 문제 정의

현재 Process Dashboard는 기능적으로 완성되었으나, **외부에 보여주기 어려운 MVP 수준의 비주얼**이다.

- 색 배치가 Linear/Height/Jira 리셋 전 generic SaaS 대시보드와 거의 동일
- Active/inactive 요소의 시각적 무게 분리가 약함
- Phase 진행 흐름(P0→P4)이 카드 5개 평등 배치로 인해 **"프로세스"라는 핵심 메시지가 약함**
- Metric number가 홀로 너무 크게 떠 있어 의미가 반전됨 (예: `OPERATIONS: 0`)
- 사이드바 메뉴가 2컬럼이라 한국어 긴 레이블에서 깨짐/비닐링 발생
- 레퍼런스 사이트를 보여주기 어려운 수준 → 고객/투자/파트너에게 Goodz 시스템을 설명할 때 "이거 디자인이..." 라는 말이 나옴

---

## 2. 목표

1. **화이트 테마 유지**하면서 "디자이너가 작업한 것처럼" 보이게 개선
2. **시그니처 모먼트**를 하나 만들어 문서 뷰어 느낌 → 실제 운영 대시보드 느낌으로 전환
3. **Phase 흐름(P0→P4)**을 한눈에 읽히게 개선: 연결선, 현재 단계 하이라이트, 완료/대기 상태의 명암비
4. **색 체계 정돈**: Primary accent 1개 + 상태 색 3개 + 나머지 zinc 회색
5. **정보 계층 재분배**: metadata, heading, body text, number 사이즈 차이 명확화
6. 마이크로 디테일: 그림자 레벨, border-radius, hover duration, typography tracking, focus-visible

## 비목표

- 기능 추가/삭제, API 변경
- 다크모드 추가
- 모바일 반응형 (태블릿/데스크톱만)
- i18n (한국어 고정)

---

## 3. 디자인 원칙

### 3.1 색 체계
```
Primary      #171717 (거의 블랙) — active indicator, primary button, progress fill
Accent(Violet)  #7C3AED — 1회만:로고, active ring, 좌측 보더
Success      #059669 (emerald-600) — done, 정상 연결
Warning      #D97706 (amber-500) — evidence 이슈, partial 연결
Danger       #DC2626 (rose-600) — high severity 이슈
Surface      #FFFFFF, #FAFAFA, #F4F4F5 — 카드/사이드바/배경
Border       #E5E7EB (zinc-200) — 카드 구분
Muted text   #737373 (zinc-500) — metadata, 설명
```
- 보라를 장식용 카드 배경이나 유색 shadow에 쓰지 않는다. 현재 단계 ring·active indicator처럼 의미 있는 신호에만 사용한다.
- success/warning/danger의 옅은 배경은 작은 상태 badge에만 허용한다.
- Active 상태는 Primary(#171717) 또는 좌측 violet 보더로만 표현.

### 3.2 Typography 계층
```
Display    32px / bold / tracking-tight   — Hero heading
Heading1   24px / bold / tracking-tight   — 섹션 타이틀
Heading2   18px / semibold                — 카드 타이틀
Body       14px / regular / leading-6     — 설명, 서브텍스트
Caption    12px / semibold / uppercase    — META_LABEL, badge
Mono       12px / regular / tabular-nums  — 수치, SPRINT/VERSION
```

### 3.3 카드/레벨
```
Shadow 레벨 3단계
  L1: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)    — 기본 카드
  L2: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)   — Hover, 강조 카드
  L3: 0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.07)  — Hero/Modal

Border radius: 16px (rounded-2xl) — 전체 카드 통일
Hover duration: 150ms
```

---

## 4. 사용자 스토리 & AC

| ID | 사용자 스토리 | AC |
|----|--------------|-----|
| U-01 | 인증된 운영자가 첫 화면에서 **현재 스프린트 상태를 한눈에** 확인하고 싶다 | 상단에 trace coverage와 전체 진행률 게이지가 hero 영역에 표시되어야 함 |
| U-02 | 운영자가 **P0→P4 흐름**을 직관적으로 이해하고 싶다 | Phase 카드가 연결선으로 묶여 있고, 현재 단계는 violet ring + 좌측 보더로 하이라이트되어야 함 |
| U-03 | 운영자가 "지금 뭐가 중요한지" 3초 안에 파악하고 싶다 | CTA 3개가 같은 시각적 무게가 아니어야 함: START > NEXT SIGNAL > HEALTH 순 |
| U-04 | 운영자가 메뉴에서 원하는 섹션으로 **빠르게 이동**하고 싶다 | 사이드바가 1컬럼이고, active item은 좌측 violet 보더 3px로 표시되어야 함 |
| U-05 | 운영자가 metric 카드에서 **0이라는 숫자를 불안해하지** 않고 싶다 | OPERATIONS 카드에서 `0` big number를 없애고 상태 badge로 대체하거나 카드 자체를 제거 |
| U-06 | 운영자가 "이 대시보드가 라이너/버셜급이다" 라는 느낌을 받고 싶다 | 폰트 계층, 그림자, border-radius, hover transition이 위 원칙을 충족해야 함 |
| U-07 | 화이트 테마가 **지저분하지 않고 깔끔**해야 한다 | 장식용 pastel 카드 배경을 제거하고 일반 surface는 `bg-white` + `border-zinc-200`로 통일 |

---

## 5. 화면 단위 명세 (Section Spec)

### 5.1 Hero Header
- `현재 Sprint · S16` → `text-xs font-semibold text-brand-violet`
- `시스템 v0.14 — Design OS` → `text-[32px] font-bold tracking-tight text-zinc-950`
- 태그(`Command center`, `SSOT · status.json`, `Operator ready`) → `rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700`
- 우측 메타데이터 4줄 (`SPRINT S16`, `VERSION v0.14`, `UPDATED ...`, `SECTION 개요`) → `monospace text-xs text-zinc-500` + key bold

### 5.2 시그니처 모먼트 (Hero Metrics)
```
┌────────────────────────────────────────────────────────────┐
│  운영 건강도                               전체 진행률       │
│  ▰▰▰▰▰▰▰▰▱▱  87%                      ▰▰▰▰▰▰▰▰▰▰ 100%    │
│  Lead 24.0h · CI 100% · Ev 24        Queue 없음 · Snapshot 3 │
└────────────────────────────────────────────────────────────┘
```
- `traceCoverage` progress bar를 여기에 배치
- 2컬럼: 좌 `delivery health`, 우 `overall progress`
- 각 sub metric은 `text-xs text-zinc-500`으로 작게

### 5.3 Action Cards (CTA 3개)
```
[ START HERE ]          [ NEXT SIGNAL ]          [ HEALTH ]
bg-white                bg-white                  bg-white
border-l-4 border-violet-500  border border-zinc-200  border border-zinc-200
shadow-[L2]             shadow-[L1]               shadow-[L1]
text-lg title           text-base title           text-3xl title (100%만 크게)
```

- START HERE만 좌측 violet indicator + 그림자 L2, 나머지는 흰 배경 + L1
- HEALTH는 title을 `text-3xl tracking-tight`으로, 100%만 크게 보여주고 summary는 작게

### 5.4 Sidebar Navigation
- 1컬럼으로 변경 (현재 `grid-cols-2`)
- 각 item: `flex items-center gap-3 px-3 py-2.5 rounded-xl`
  - 좌측: active일 때만 `w-[3px] h-5 bg-brand-violet rounded-full`
  - 중간: eyebrow(`text-[11px] text-zinc-500`) + label(`text-sm font-semibold`)
  - 설명: `text-xs text-zinc-500 truncate` (lg 이상에서만 표시)
  - 우측: `›` 화살표는 **접힘 상태일 때만** 표시하거나, active item만 표시
- Quick Jump 탭:
  - Active: `bg-zinc-950 text-white`
  - Inactive: `border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400`
  - **절대** `text-zinc-400`로 사라지게 하지 않음

### 5.5 Phase Signal (P0-P4 Flows)
```
[ P0 기획 ] ──▸ [ P1 디자인 ] ──▸ [ P2 개발 ] ──▸ [ P3 QA ] ──▸ [ P4 배포 ]
 완료         완료           현재 운영        대기          대기
             ↑
          violet ring + ring-offset-[#F4F4F5]
```
구현:
- outer flex row, `items-center gap-0`
- 각 카드: `flex-1 rounded-2xl border p-4`
- 연결선: 각 카드 사이 `span`으로 `w-6 h-px bg-zinc-300`
- 완료된 phase: `bg-zinc-950 text-white border-zinc-950 shadow-[L2]`
- 현재 phase: `bg-white border-violet-400 ring-2 ring-violet-400 ring-offset-2 ring-offset-[#F4F4F5] shadow-[L1]`
- 대기 phase: `bg-white border-zinc-200 text-zinc-500 shadow-none`
- `StatusBadge`는 완료 카드에서는 흰색 텍스트, 대기 카드에서는 zinc

### 5.6 Metric Cards (3개)
```
[ 완료 ]                    [ 배달 건강도 ]               ← 3번째 카드 제거
 5/5                        100%
 Deliverable 30/30          Lead 24.0h · CI 100%
 Approval 12/12             Snapshot 3
```
- COMPLETION: 흰 배경 + 좌측 emerald 보더 3px, 내부에 녹색 완료 뱃지
- DELIVERY HEALTH: `bg-[#F7F7F7]` + zinc 보더 + `text-3xl font-bold tracking-tight text-zinc-950`
- OPERATIONS 카드 **제거**. 내용은 Hero Metrics에 녹이거나, 우측 사이드바 하단에 "현재 작업 없음" 배지로 대체.

### 5.7 Meta Bar
상단에 4개 metadata를 `flex items-center gap-4 text-xs`로:
```
[Sprint S16 ▾]    Version v0.14    Updated 2026-07-13    개요 · Overview
 bold             mono #555         #737373                badge bg-zinc-100
```

### 5.8 PhaseSection Operating Map 다크 카드
- 다크 섹션 하단과 우선 처리 작업 섹션 사이에 `bg-gradient-to-b from-zinc-950 to-white h-8` 추가
- 다크 카드 내 Phase 번호(P0)는 `font-mono text-xs text-white/55`
- 현재 운영 phase의 카드에만 `border-t-2 border-t-violet-400`
- 우선 처리 작업 섹션: "현재 미완료 작업이 없습니다" → `text-sm text-zinc-500` + 초록 dot

---

## 6. 구현 상세 (Implementation Details)

### 6.1 공통 유틸 추가
`apps/process-dashboard/src/styles.ts` (신규) 또는 `index.css` 상단에 constants 추가:
```tsx
const CARD_RADIUS = "rounded-2xl";
const SHADOW_L1 = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]";
const SHADOW_L2 = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.05)]";
const SHADOW_L3 = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.07)]";
const TRANSITION = "transition duration-150";
```

### 6.2 focus-visible 패턴 (전역)
```css
button:focus-visible, a:focus-visible, input:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #7C3AED33;
}
```

### 6.3 레퍼런스 비교 체크리스트
리디자인 후 아래 기준을 충족하는지 확인:
- [ ] 단일 primary 액센트(#171717 또는 violet)만 사용, 나머지는 zinc
- [ ] 장식용 `bg-violet-50`, `bg-amber-50`, `bg-emerald-50` 카드 배경이 남아있지 않음
- [ ] Phase 카드에 연결선 또는 arrow 흐름이 시각적으로 표현됨
- [ ] 사이드바 active item이 좌측 3px 보더로 구분됨
- [ ] Hero 영역에 big number 또는 progress bar가 있음 (문서 뷰어 아님)
- [ ] 모든 카드 border-radius가 14~16px로 통일됨
- [ ] 모든 그림자가 3단계 shadow constants로 통일됨
- [ ] Hover transition이 `duration-150`으로 통일됨
- [ ] 운영자가 "깔끔하다" + "고급스럽다" + "화이트 테마 좋다" 라고 말하는지 (디자인 리뷰에서 검증)

---

## 7. QA 기준

### 7.1 기능 QA
- `pnpm --filter process-dashboard dev`로 로컬 구동 정상
- `/` 접속 → API 에러 없이 데이터 로딩
- 사이드바 검색 여전히 작동
- 모든 섹션 이동(navigate) 정상
- ActionCard 클릭 → 해당 섹션 열림

### 7.2 비기능 QA
- Lighthouse: Performance 90+, Accessibility 90+
- 모바일(320~480px): 가로 스크롤 없이 최소 읽기 가능 (반응형 필수 아님)
- `prefers-reduced-motion` 존중: hover translate 제거

### 7.3 디자인 QA
- 스크린샷 3장 (Sidebar / Hero / Phase)을 디자인 리뷰에 제출
- 위 6.3 체크리스트 통과

---

## 8. 일정

| 작업 | 담당 | 예상 | 의존 |
|------|------|------|------|
| PRD 작성 | Hermes | 완료 | — |
| 디자인 리뷰 | 사용자 + 디자이너 | 1일 | PRD Approved |
| Hero Header + Sidebar 스타일 변경 | Cursor | 1d | PRD Approved |
| Phase Flow + Metric Cards 변경 | Cursor | 1d | Hero/Sidebar 완료 |
| 공통 유틸 + 전역 shadow/transition 정리 | Cursor | 0.5d | PRD Approved |
| QA + 스크린샷 검증 | Hermes | 0.5d | 구현 완료 |
| git commit/push | Cursor | 0.1d | QA 통과 |

---

## 9. 변경 로그

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-07-13 | v0.1 | PRD 초안 작성 — 흰 테마 프리미엄 디자인 리셋 | Hermes |
| 2026-07-13 | v1.0 | 현재 v0.18 기준 정합성 수정, 장식 색과 상태 색 책임 분리, 사용자 승인 | Codex |

---

## 11. 현재 적용 범위

| 영역 | 상태 | 적용 내용 |
|---|---|---|
| Hero | 완료 | Sprint display, CTA 위계, trace coverage와 전체 진행률 게이지 |
| Sidebar | 완료 | 1컬럼, active violet indicator, Quick Jump 대비, disclosure와 전용 scrollbar |
| Phase flow | 완료 | P0-P4 연결 화살표, 완료/현재 상태 대비, 현재 단계 ring |
| Metrics | 완료 | Completion과 Delivery Health 2개 카드, Operations 숫자 카드 제거 |
| Micro detail | 완료 | 16px core surface, 3단 shadow token, 150ms transition, focus-visible, reduced motion |
| 인증 | 완료 | 외부 배포 Basic Auth, 로컬 개발 인증 생략 |
| 디자인 QA | 대기 | 인앱 브라우저가 있는 세션에서 Sidebar/Hero/Phase 스크린샷과 Lighthouse 기록 |

---

## 10. 관련 문서

- `docs/00-process/USER_MANUAL.md` — 서비스 이용법
- `docs/00-process/NORTH_STAR.md` — 방향성
- `docs/00-process/AGENT_GUIDE.md` — 에이전트 협업 규칙
- `docs/03-engineering/API.md` — API 명세
- `apps/process-dashboard/src/App.tsx` — 현재 구현체
- `apps/process-dashboard/tailwind.config.ts` — Tailwind 설정
- `apps/process-dashboard/src/index.css` — 글로벌 스타일
- Linear Redesign 참고: https://linear.app/blog/how-we-redesigned-the-linear-ui
