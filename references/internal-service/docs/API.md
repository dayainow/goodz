# P2 — Internal Service API

Base URL: `http://localhost:4200`

타입 SSOT: `@goodz/internal-service-types`

## `GET /health`

```json
{ "ok": true, "service": "goodz-internal-service-reference" }
```

## `GET /api/services`

`ServiceCatalogResponse`를 반환한다.

## `GET /api/services/:id`

`ManagedService`를 반환한다. 존재하지 않으면 `404`다.

이 API는 `@goodz/process`와 `@goodz/types`를 import하지 않는다.
