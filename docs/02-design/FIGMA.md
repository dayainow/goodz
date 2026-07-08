# Goodz Figma

## 파일 (등록 예정)

| 파일 | 링크 | 설명 |
|------|------|------|
| Goodz — Web Shop | _TBD_ | 고객 쇼핑몰 |
| Goodz — Admin | _TBD_ | 어드민 |

> 디자인 착수 시 위 표에 Figma URL을 추가하세요.

## 페이지 구조 (권장)

```text
📁 Goodz Web Shop
├── 🎨 Foundations (Color, Type, Spacing)
├── 🧩 Components (Button, Card, Input)
├── 📱 Screens
│   ├── Product List
│   ├── Product Detail
│   ├── Cart
│   └── Checkout
└── 📋 Specs (Annotation)
```

## 화면 스펙 문서

| 화면 | 문서 |
|------|------|
| 상품 목록 | [screens/product-list.md](./screens/product-list.md) |

## Figma MCP 워크플로우

1. `get_metadata` → 자식 node-id 수집
2. `get_design_context` → 코드 참고
3. `@goodz/ui` 우선, 없으면 앱 로컬 컴포넌트

참고: [figma-publish](https://github.com/dayainow/figma-publish)
