# SQLite Operations v0.18 입력

- Intake ID: IN-017
- 요청일: 2026-07-13
- 요청: Process Dashboard에 SQLite를 적용하고 배포·README까지 연결
- 목표: 문서 SSOT는 유지하면서 운영 사건을 영속적으로 기록하고 한 서비스로 배포 가능한 구조 확보
- 범위: 공통 타입, SQLite migration/seed, 운영 API, 운영 DB 화면, Render Blueprint, 검증·운영 문서
- 제외: 쇼핑몰 주문 DB 전환, 인증, 다중 인스턴스 DB
- 승인 기준: `pnpm verify`, SQLite 스모크, 배포 구성과 영구 디스크 주의사항 문서화
