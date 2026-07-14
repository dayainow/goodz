# Goodz — 브랜딩 & 사업화 전략

| 항목 | 내용 |
|---|---|
| 작성일 | 2026-07-13 |
| 버전 | v1.1 |
| 상태 | Approved — 제품명과 플랫폼 경계 확정 |
| 제품명 | **Goodz** |
| 관련 | `NORTH_STAR.md`, `ROADMAP.md`, `ARCHITECTURE.md`, ADR-003 |

---

## 1. 브랜드 구조

### 1.1 정식 명칭

| 용도 | 명칭 | 의미 |
|---|---|---|
| 마스터 브랜드 | **Goodz** | 기획부터 배포까지 연결하는 풀 프로세스 운영 시스템 |
| 오픈 코어 | **Goodz Core** | Process 모델, CLI, 스키마, Gate 엔진, 기본 템플릿 |
| 관리형 제품 | **Goodz Cloud** | 호스팅, 협업, Connector, 운영 대시보드, 관리형 업그레이드 |
| 엔터프라이즈 | **Goodz Enterprise** | SSO/SCIM, RBAC, 감사, 정책 팩, VPC/온프레미스, SLA |
| 공식 예제 | **Goodz Commerce Reference** | web-shop/admin/commerce API로 플랫폼 동작을 증명하는 참조 구현 |

제품명은 `Goodz System`, `Goodz OS`, `Fullpress`로 분산하지 않고 **Goodz**로 통일한다. 문맥상 제품 범위를 명확히 해야 할 때만 Core/Cloud/Enterprise 접미사를 사용한다.

### 1.2 한 줄 정의

> **Goodz는 기획 → 디자인 → 개발 → QA → 배포를 문서·게이트·모노레포·CI·AI로 연결하는 풀 프로세스 운영 시스템이다.**

### 1.3 Reference 표기 원칙

> **Goodz Commerce Reference는 제품이 아니라 Goodz가 실제 팀과 코드에서 동작함을 증명하는 예제다.**

- 상품, 장바구니, 체크아웃, 쇼핑 어드민은 Commerce Reference 소유다.
- Phase, Gate, Artifact, Evidence, Approval, Metric, Incident는 Goodz Core 소유다.
- 랜딩과 README에서 “Goodz = 쇼핑몰”로 읽히는 표현을 사용하지 않는다.
- 새로운 산업 예제는 Goodz Core를 수정하지 않고 별도 Reference로 추가한다.

### 1.4 슬로건과 보이스

**메인:** 프로세스부터 코드까지, 하나의 시스템.

**서브:**

- 랜딩 Hero: “기획에서 배포까지, 한 흐름으로.”
- GitHub: “문서·게이트·모노레포·CI·AI로 연결한 풀 프로세스 운영 시스템.”
- Enterprise: “팀의 개발 프로세스를 감사 가능하고 재현 가능한 운영 체계로.”

보이스는 단호하되 친절하고, 실제 운영 기준과 증거를 우선한다. “혁신적”, “차세대”, “AI 기반”처럼 검증하기 어려운 표현은 피한다.

---

## 2. 포지셔닝

### 2.1 포지셔닝 문장

> **Goodz는 또 하나의 프로젝트 관리 도구가 아니다. 요청에서 산출물, 승인, 코드, CI와 릴리스까지 연결하는 Process Control Plane이다.**

### 2.2 핵심 가치

1. **재현 가능성:** 팀과 프로젝트가 바뀌어도 같은 구조와 품질 기준으로 시작한다.
2. **추적 가능성:** 요청 → 산출물 → 승인 → 커밋 → CI → 배포 증거를 연결한다.
3. **통제 가능성:** Phase Gate와 정책으로 누락과 무승인 변경을 줄인다.
4. **AI 준비성:** 에이전트가 읽을 수 있는 규칙, 계약과 역할을 저장소에 둔다.

### 2.3 경쟁 범위

| 범주 | 기존 대안 | Goodz의 역할 |
|---|---|---|
| 모노레포 | Nx, Turborepo | 프로젝트 구조 위에 Process Gate와 산출물 계약 제공 |
| 이슈 관리 | Jira, Linear | 대체하지 않고 요청·승인·코드 증거를 연결 |
| 개발 포털 | Backstage 계열 | Catalog보다 initiative→gate→evidence 흐름에 집중, 향후 Connector 제공 |
| CI | GitHub Actions 등 | 실행 엔진을 대체하지 않고 Gate 증거로 수집 |
| 문서 | Notion, Git 문서 | 선언과 산출물의 버전 SSOT 제공 |

---

## 3. 제품 구조

```text
Goodz
├── Core
│   ├── @goodz/process
│   ├── Process Dashboard
│   ├── process API/data
│   ├── goodz.config.json + schema
│   └── Phase templates / verify
├── Cloud
│   ├── hosted control plane
│   ├── collaboration / connectors
│   └── managed upgrade / backup
├── Enterprise
│   ├── SSO / SCIM / RBAC
│   ├── audit / policy packs
│   └── VPC / on-prem / SLA
└── References
    └── Goodz Commerce Reference
        ├── @goodz/types
        ├── web-shop
        ├── admin-dashboard
        └── commerce API/data
```

코드 경계 결정은 `docs/03-engineering/ADR/003-platform-commerce-boundary.md`가 SSOT다.

---

## 4. 사업화 모델

### 4.1 Goodz Core — Open Core

**제공:**

- Process 모델과 버전 설정 스키마
- CLI의 `init`, `adopt`, `verify`
- Phase Gate 엔진과 기본 템플릿
- Process Dashboard 기본판
- GitHub 기반 증거 연결 예제
- Goodz Commerce Reference

Core는 실제로 도입 가능해야 한다. UI나 핵심 스킬을 제거해 의도적으로 불완전한 무료판을 만들지 않는다.

### 4.2 Goodz Cloud — 구독

**가치:** 설치 파일이 아니라 운영 부담을 줄이는 관리형 서비스.

- 조직·팀·프로젝트 협업
- GitHub/GitLab/Jira/Slack Connector
- Webhook/Worker와 관리형 PostgreSQL
- 관리형 업그레이드, 백업, 복구
- 운영 대시보드와 알림
- 이메일/우선 지원

가격은 디자인 파트너 검증 전 확정하지 않는다. 초기 가설은 팀 단위 월 구독이며 좌석 수보다 프로젝트·Connector·운영 수준을 주요 변수로 둔다.

### 4.3 Goodz Enterprise — 계약

- OIDC/SAML, SCIM, 조직·프로젝트 RBAC
- Append-only 감사 로그와 보존 정책
- 조직별 정책 팩과 승인 위임
- VPC/온프레미스 설치, 비밀 관리, 백업·복구
- 업그레이드·롤백 지원과 SLA
- 도입 진단, 프로세스 매핑, 교육

Enterprise는 “커스텀 문서 제작”이 아니라 **격리·거버넌스·감사·운영 보장**에 비용을 받는다.

---

## 5. 현실적인 전환 로드맵

### 1단계 — 플랫폼 경계 추출

- [x] 제품명 Goodz 확정
- [x] Goodz Commerce Reference 명명
- [x] `@goodz/process`와 `@goodz/types` 분리
- [x] process/commerce API 라우터 분리
- [x] `goodz.config.json`과 ADR-003으로 경계 기록
- [ ] clean clone에서 전체 검증

### 2단계 — 이식 가능성 검증

- [ ] 비커머스 Reference 1종 선정: 내부 API 서비스 권장
- [ ] 자체 타입·설정·템플릿만으로 P0–P4 실행
- [ ] `@goodz/process` 수정 0건 확인
- [ ] 도입 시간과 실패 지점 기록

성공 기준은 “두 번째 예제가 보인다”가 아니라 **코어 수정 없이 작동한다**는 것이다.

### 3단계 — 설치 가능한 플랫폼

- [ ] `goodz init`
- [ ] `goodz adopt`
- [ ] `goodz verify`
- [ ] 설정 버전과 마이그레이션
- [ ] PostgreSQL + Worker
- [ ] GitHub 첫 Connector
- [ ] Docker Compose 설치판

### 4단계 — 엔터프라이즈 기반

- [ ] OIDC/SSO와 조직·프로젝트 RBAC
- [ ] 감사 로그와 정책 팩
- [ ] 백업·복구·업그레이드·롤백
- [ ] OpenTelemetry 관측성
- [ ] VPC/온프레미스 배포 기준
- [ ] 서로 다른 산업 디자인 파트너 2곳 검증

---

## 6. 성과 지표

초기에는 Star보다 도입 가능성을 먼저 측정한다.

| 지표 | 초기 목표 |
|---|---|
| Time to first Gate | 신규 저장소 30분 이내 |
| Core portability | 두 번째 Reference의 Core 수정 0건 |
| Trace completeness | 필수 증거 95% 이상 |
| Upgrade success | 샘플 프로젝트 자동 마이그레이션 100% |
| Design partners | 서로 다른 산업 2팀 |
| Weekly active operators | 도입 팀 운영자 주 1회 이상 사용 |

GitHub Stars, Forks, 커뮤니티 인원은 보조 지표로만 사용한다.

---

## 7. 랜딩 원칙

1. Hero에서 Goodz가 “프로세스 운영 시스템”임을 3초 안에 이해시킨다.
2. Process Dashboard를 제품 화면으로 제시한다.
3. Commerce 화면은 “Reference implementation” 배지를 붙여 분리한다.
4. 가격 카드는 **Core / Cloud / Enterprise**로 표기한다.
5. 과장된 고객 로고나 미검증 SLA를 노출하지 않는다.
6. Primary CTA는 “Goodz Core로 시작하기”, Secondary CTA는 “도입 상담”으로 둔다.

---

## 8. 확정·보류 결정

| 항목 | 결정 |
|---|---|
| 제품명 | **Goodz** 확정 |
| 제품군 | Core / Cloud / Enterprise |
| 공식 예제 | Goodz Commerce Reference |
| 도메인 | 상표·가용성 확인 후 결정 |
| 가격 | 디자인 파트너 검증 후 확정 |
| 공개 범위 | Core가 실제 작동하는 수준으로 공개, Enterprise 운영 기능은 별도 |
| 법인 | 첫 반복 매출 또는 Enterprise 계약 전 결정 |
