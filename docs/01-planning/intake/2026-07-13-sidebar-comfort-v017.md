# Sidebar Comfort v0.17 입력

## 배경

사이드바에서 모든 메뉴 그룹이 펼쳐지고 그룹 카드 안에 메뉴 카드가 중첩되어, 작은 높이에서 여백이 부족하고 스크롤 거리가 길었습니다. 스크롤바도 콘텐츠와 너무 붙어 탐색 영역의 경계가 불명확했습니다.

## 목표

- 활성 메뉴 그룹만 자동으로 열어 초기 스크롤 길이를 줄입니다.
- 그룹 외곽 카드 장식을 제거해 중첩된 표면을 줄입니다.
- 헤더, 요약, 탐색, SSOT 푸터의 영역을 분리합니다.
- 전용 scrollbar gutter와 track/thumb 디자인을 적용합니다.

## 완료 기준

- process-dashboard build와 typecheck 통과
- 360px sidebar 기준 좌우 20px padding 유지
- 탐색 영역만 스크롤되고 SSOT 푸터는 고정
- 사이드바 전용 scrollbar가 문서화됨
