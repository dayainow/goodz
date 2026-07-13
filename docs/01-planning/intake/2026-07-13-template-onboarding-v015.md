# Template Onboarding v0.15 입력

## 배경

Goodz v0.14까지 Process OS와 대시보드는 충분히 성숙했지만, 새 팀이 저장소를 fork했을 때 무엇을 바꾸고 어떻게 첫 Gate를 통과하는지 하나의 런북으로 정리되지 않았습니다. web-shop의 분석 하네스도 저장소 밖 로컬 폴더를 참조해 clean clone 설치를 막고 있었습니다.

## 목표

- 30분 fork 온보딩 런북을 제공합니다.
- 필수 파일·스크립트·env example을 기계 판독 계약으로 관리합니다.
- 저장소 밖 file 의존성을 금지해 독립 설치 가능성을 검증합니다.
- v1.0 승격 전 clean-clone CI와 실제 새 프로젝트 리허설을 남겨둡니다.

## 완료 기준

- docs/00-process/ONBOARDING.md
- template.config.json
- pnpm check:template
- pnpm verify와 CI에 template contract 포함
- GA harness의 로컬 형제 저장소 결합 제거

## 다음 단계

GitHub의 새 저장소에서 clean clone → install → verify → 4앱 smoke를 수행하고, 이름·scope 변경을 자동화하는 initializer를 검토합니다.
