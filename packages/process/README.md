# @goodz/process

Goodz 플랫폼의 도메인 중립 Process OS 계약입니다.

- 포함: Phase, Gate 체크 항목, 산출물, 승인, 추적, 지표, 운영 사건
- 미포함: 상품, 장바구니, 체크아웃 등 Goodz Commerce Reference 타입
- 의존 방향: `@goodz/process → control-plane API → process-dashboard`

새로운 레퍼런스 도메인은 이 패키지를 수정하지 않고 자체 도메인 타입 패키지를 추가해야 합니다.
