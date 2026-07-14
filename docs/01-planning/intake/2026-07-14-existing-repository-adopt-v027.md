# Existing Repository Adopt v0.27

- 요청: 다음 단계가 끝날 때까지 단계별 구현·검증·배포
- 목표: 기존 모노레포를 파괴하지 않고 Goodz 도입 설정 초안을 생성
- 범위: 구조 탐지, read-only 계획, 명시적 apply, 기존 설정 보호
- 비범위: 앱 복사, 의존성 변경, Template 데이터 마이그레이션, Git 원격 조작
- 승인 기준: CLI 테스트, 실제 임시 모노레포 adopt·verify, `pnpm verify`, CI·배포 smoke
