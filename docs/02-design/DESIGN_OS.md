# Goodz Design OS

Goodz Design OS는 화면을 예쁘게 만드는 문서가 아니라, **레퍼런스 → 디자인 시스템 → 와이어프레임 → 스토리보드 → 개발 handoff**를 연결하는 디자인 운영 체계입니다.

## 목표

- 디자인 레퍼런스를 근거 있는 결정으로 남깁니다.
- 디자인 시스템 토큰과 컴포넌트 사용 규칙을 제품 전반의 SSOT로 유지합니다.
- 새 화면을 만들 때 와이어프레임과 스토리보드를 먼저 남겨 개발 범위를 줄입니다.
- 대시보드에서 디자인 산출물 상태를 확인하고, trace link와 승인 흐름에 연결합니다.

## Design OS 흐름

```text
Reference Board
  -> Design System
  -> Wireframe
  -> Storyboard
  -> Screen Spec
  -> Development
```

## 산출물

| 산출물 | 문서 | 역할 |
|--------|------|------|
| Reference Board | [REFERENCES.md](./REFERENCES.md) | 외부 디자인 시스템과 레퍼런스의 차용점 기록 |
| Design System | [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Goodz 색상, 타이포, 컴포넌트, 사용 규칙 |
| Wireframes | [wireframes/README.md](./wireframes/README.md) | 화면별 저해상도 구조와 정보 우선순위 |
| Storyboards | [storyboards/README.md](./storyboards/README.md) | 사용자의 작업 흐름과 화면 전환 |
| Screens | [screens/README.md](./screens/README.md) | 개발 handoff용 화면 스펙 |

## 운영 규칙

1. 새 디자인 요청은 `intakes` 또는 `planningChanges`에 남깁니다.
2. 레퍼런스가 있으면 `designReferences`에 등록하고 `REFERENCES.md`에 근거를 기록합니다.
3. 새 화면은 먼저 `wireframes`에 등록합니다.
4. 작업 흐름이 있는 기능은 `storyboards`에 사용자 여정을 남깁니다.
5. 승인 대상이면 `approvals`와 `traceLinks`에 연결합니다.
6. 개발 착수 전 `DESIGN_SYSTEM.md`와 모순이 없는지 확인합니다.

## v0.13 범위

- `status.json`에 `designReferences`, `wireframes`, `storyboards` 추가
- 대시보드 `디자인` 메뉴 추가
- 레퍼런스 보드와 기본 와이어프레임/스토리보드 문서 추가
- `pnpm check:process`에서 디자인 산출물 참조 검증
