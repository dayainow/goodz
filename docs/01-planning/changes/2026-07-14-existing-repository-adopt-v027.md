# v0.27 Existing Repository Adopt 변경

## 변경

- `goodz adopt [--name] [--root] [--apply] [--force]` 추가
- top-level 앱과 `references/<id>/apps` 구조 탐지
- `/types` 또는 `-types` 패키지를 Reference 타입 후보로 연결
- 기본 실행 무변경과 기존 설정 덮어쓰기 방지 테스트 추가

## 결정

도입 자동화는 기존 저장소를 직접 재구성하지 않는다. 탐지 결과를 먼저 출력하고 사용자가 `--apply`로 승인하는 2단계 흐름을 사용한다.
