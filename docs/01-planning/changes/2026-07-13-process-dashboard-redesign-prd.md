# Process Dashboard Redesign PRD 반영

- Change ID: CR-018
- 연결 입력: IN-018
- 상태: applied
- 변경일: 2026-07-13

## 반영 내용

1. PRD를 현재 Process OS v0.18 이후 기준으로 정규화했다.
2. 장식용 pastel과 의미 있는 상태 badge의 책임을 분리했다.
3. Sidebar를 1컬럼과 violet active indicator로 정리했다.
4. Hero에 trace coverage와 전체 진행률을 함께 배치했다.
5. Operations 숫자 요약 카드를 제거하고 Queue 상태를 Hero에 통합했다.
6. core surface 16px radius, shadow token, 150ms transition, focus-visible, reduced motion을 적용했다.

## 후속 검증

- 인앱 브라우저가 있는 세션에서 Sidebar/Hero/Phase 스크린샷
- Lighthouse Performance·Accessibility 기록
