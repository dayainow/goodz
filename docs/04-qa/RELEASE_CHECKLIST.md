# Goodz 릴리스 체크리스트

## 스테이징 배포 전

- [ ] `pnpm verify` 로컬 pass
- [ ] GitHub Actions CI green
- [ ] PRD MVP AC 반영 여부 확인
- [ ] env 변수 스테이징 설정 (`NEXT_PUBLIC_API_URL`, `VITE_API_URL`)
- [ ] API health check

## 프로덕션 배포 전

- [ ] 스테이징 TC-001~003 pass
- [ ] 롤백 plan (이전 빌드 태그)
- [ ] GA4 이벤트 스테이징 검증 (해당 시)
- [ ] 이슈 마일스톤 close

## 배포 후

- [ ] 프로덕션 smoke test
- [ ] `PROJECT.md` Phase 상태 갱신
- [ ] 회고 메모 (선택)
