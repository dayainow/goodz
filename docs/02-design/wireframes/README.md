# Wireframes

Goodz 와이어프레임은 고해상도 시안 전에 **정보 구조와 작업 우선순위**를 빠르게 합의하기 위한 저해상도 산출물입니다.

## WF-001 — Process Dashboard Design Menu

대시보드 안에서 Design OS 산출물을 확인하는 화면입니다.

```text
+-------------------------------------------------------------+
| Header: 디자인 / Reference, Wireframe, Storyboard 상태       |
+---------------------+---------------------------------------+
| Design System       | Reference Board                       |
| tokens / components | DR-001 Atlassian                      |
| usage rules         | DR-002 Carbon                         |
|                     | DR-003 Polaris                        |
+---------------------+---------------------------------------+
| Wireframes          | Storyboards                           |
| WF-001 Dashboard    | SB-001 기획 -> 디자인 -> 개발          |
| WF-002 Admin        | SB-002 레퍼런스 선택 -> 승인           |
+---------------------+---------------------------------------+
```

### 정보 우선순위

1. 디자인 산출물 총량과 완료 상태
2. 레퍼런스와 적용 화면
3. 와이어프레임 목록
4. 스토리보드 목록
5. 원문 문서 경로

### 연결

- References: `DR-001`, `DR-002`, `DR-003`, `DR-004`
- Storyboards: `SB-001`
- Doc: `docs/02-design/DESIGN_OS.md`

## WF-002 — Admin Product Operations

상품 운영자가 상품 목록과 등록 상태를 확인하는 Admin 화면의 저해상도 구조입니다.

```text
+------------------+------------------------------------------+
| Sidebar          | 상품 목록 / 상품 등록 CTA                 |
| - 상품 목록       +------------------------------------------+
| - 상품 등록       | Table: ID / 상품명 / 카테고리 / 가격 / 재고 |
|                  | Empty / loading / error state              |
+------------------+------------------------------------------+
```

### 연결

- References: `DR-002`, `DR-003`
- Storyboards: `SB-002`
- Doc: `docs/02-design/screens/README.md`
