# Sidebar Comfort v0.17 변경

## 요청

사이드바의 부족한 여백과 불편한 스크롤 동작을 개선합니다.

## 변경

- sidebar width를 360px, horizontal padding을 20px로 조정
- header status를 우측 상단에 고정
- Plan, Control, System 그룹을 기본 접힘으로 변경
- 그룹 외곽 카드 제거와 section divider 적용
- navigation에 min-height 0, flex 1, bottom padding 적용
- SSOT footer를 고정 영역으로 분리
- 8px rounded scrollbar, stable gutter, 48px minimum thumb 적용

## 결정

스크롤 길이를 줄이기 위해 메뉴 높이를 억지로 압축하지 않고, 활성 그룹 자동 열기와 비활성 그룹 기본 접힘을 사용합니다. 표면 중첩을 줄여 실제 메뉴 항목과 그룹 구조가 명확하게 보이도록 합니다.
