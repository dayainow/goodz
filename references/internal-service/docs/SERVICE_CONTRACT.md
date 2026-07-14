# P1 — Internal Service Contract

## 정보 구조

```text
Service Catalog
└── Managed Service
    ├── identity: id, name
    ├── ownership: owner
    ├── operations: tier, lifecycle, runbookUrl
    └── source: repositoryUrl
```

## 상호작용

1. 운영자가 서비스 목록을 조회한다.
2. 중요도와 lifecycle을 확인한다.
3. 서비스 상세에서 owner와 runbook으로 이동한다.

UI를 만들지 않는 API Reference이므로 P1 산출물은 화면이 아니라 소비자 관점의 정보 계약으로 정의한다.
