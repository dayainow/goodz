# Portability Proof v0.20 변경

## 요청

현재 Platform Boundary 변경을 커밋한 뒤 비커머스 Reference를 Core 수정 없이 추가한다.

## 반영

1. 기준선 커밋 `aa6c1a9`와 `@goodz/process` v0.1.0 hash를 고정했다.
2. Internal Service Reference에 자체 타입·API·P0–P4 문서를 추가했다.
3. `goodz.config.json`에 두 번째 Reference와 Core contract를 등록했다.
4. `pnpm check:portability`로 Core hash, Commerce 의존성, 산출물과 fixture를 검증한다.
5. nested Reference workspace를 전체 build/lint/dep check에 포함했다.

## 결정

비커머스 Reference가 성공했으므로 플랫폼 경계 추출의 이식성 가설은 통과했다. v1.0의 다음 차단 조건은 `goodz init/adopt/verify`, config migration과 clean-clone 검증이다.
