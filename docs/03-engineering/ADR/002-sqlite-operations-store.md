# ADR-002: 운영 실행 계층에 SQLite 사용

- 상태: Accepted
- 날짜: 2026-07-13

## 맥락

Process OS의 Phase·승인·산출물은 Git 기반 문서 SSOT가 적합하다. 반면 운영 사건, 종료 시각, MTTR 같은 가변 데이터는 매 변경마다 문서 커밋을 요구하면 운영성이 떨어진다.

## 결정

Node 내장 `node:sqlite`를 사용해 운영 실행 계층을 만든다. 문서와 `status.json`은 계속 SSOT로 유지하고, SQLite에는 문서 검색 인덱스와 운영 사건만 저장한다. 배포 환경에서는 단일 Node 서비스와 영구 디스크를 사용한다.

## 결과

- 별도 DB 드라이버 의존성 없이 migration·seed·운영 기록을 제공한다.
- Process Dashboard와 API를 같은 origin으로 제공해 배포 구성을 단순화한다.
- 로컬 DB 파일은 Git에서 제외한다.
- 영구 디스크가 없는 무료·임시 파일시스템 배포는 운영 사건 보존을 보장하지 않는다.
- 수평 확장이나 다중 writer가 필요하면 PostgreSQL 등 서버형 DB로 전환한다.
