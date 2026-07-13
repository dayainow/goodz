# Design Reference Board

Goodz가 참고하는 디자인 시스템과 레퍼런스를 기록합니다. 링크만 모으지 않고, **차용할 점 / 버릴 점 / 적용 화면**을 함께 남깁니다.

## 레퍼런스 목록

| ID | 이름 | 카테고리 | 차용할 점 | 적용 화면 |
|----|------|----------|-----------|-----------|
| DR-001 | Atlassian Design System | foundation | tokens, spacing, grid, typography처럼 기반 요소를 분리해 설명 | Process Dashboard, Design 메뉴 |
| DR-002 | IBM Carbon Design System | component | 엔터프라이즈 제품용 shell, left panel, component documentation | Process Dashboard, Admin |
| DR-003 | Shopify Polaris | commerce | 커머스 admin을 위한 components, tokens, icons, patterns | Admin, Product operations |
| DR-004 | GOV.UK Design System | accessibility | styles, components, patterns를 서비스 과업 중심으로 정리 | Guide, Intake, Approval |

## 적용 원칙

- **Atlassian**: 토큰과 foundation 설명 방식을 Goodz Design System 문서 구조에 반영합니다.
- **Carbon**: 복잡한 운영 콘솔의 navigation, shell, data table 밀도를 참고합니다.
- **Polaris**: 커머스 admin 경험, 상품 등록/관리 화면의 명확한 액션 구조를 참고합니다.
- **GOV.UK**: 접근성, 명확한 문장, 사용자가 과업을 완료하는 패턴을 참고합니다.

## 버릴 점

- Goodz는 작은 팀의 프로세스 제품이므로 과도한 브랜드 표현과 대형 조직용 governance는 최소화합니다.
- MVP 단계에서는 Figma 변수 전체를 복제하지 않고, 코드와 문서에 필요한 토큰부터 유지합니다.
- 마케팅 랜딩 페이지식 hero 구성은 운영 콘솔과 프로세스 화면에는 사용하지 않습니다.

## 다음 확장

- 레퍼런스별 스크린샷 또는 썸네일 첨부
- 화면별 reference-to-wireframe 연결
- 디자인 QA 체크리스트 자동화
