# White Premium Detail Tuning v0.16 입력

## 배경

Premium White UI는 전반적으로 정돈됐지만 Quick Jump, CTA, metric, metadata가 비슷한 시각 무게를 가져 정보 계층이 충분히 선명하지 않았습니다. 한글 타이포, 카드 깊이, 접힘 단서와 같은 마이크로 디테일도 추가 조정이 필요했습니다.

## 목표

- Quick Jump와 사이드바 active/inactive 대비를 안정화합니다.
- Start here, Next signal, Health의 중요도를 서로 다르게 표현합니다.
- 0을 크게 보여주는 대신 완료 상태와 자연어 운영 신호를 우선합니다.
- P0-P4 흐름에서 현재 운영 단계를 식별할 수 있게 합니다.
- Noto Sans KR 스택, line height, scrollbar, shadow, hover를 일관되게 조정합니다.

## 완료 기준

- process-dashboard build와 typecheck 통과
- PROCESS_DASHBOARD와 DESIGN_SYSTEM 기준 갱신
- status.json에서 요청, 변경, 산출물, 승인, trace 연결
- 브라우저 육안 QA는 사용 가능한 브라우저 세션에서 후속 수행
