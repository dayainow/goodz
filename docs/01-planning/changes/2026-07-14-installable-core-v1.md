# v1.0 Installable Core 변경

## 변경

- config schema v2와 `goodz config migrate`
- delivery export/manifest/Git 기본 정책
- `check:clean-clone` 품질 Gate
- clean CI에서 Core 선행 build 후 CLI 검증
- Core/CLI v1.0 publish metadata

## 결정

v1.0은 도입 재현성과 호환성 기준이다. 관리형 Cloud와 Enterprise 기능은 이 설치 계약 위에서 별도 버전으로 확장한다.
