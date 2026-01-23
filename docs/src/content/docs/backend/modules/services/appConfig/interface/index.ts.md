---
title: services/appConfig/interface/index.ts
nav_order: 19
parent: Modules
---

## index overview

Application configuration module surface.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Service Interfaces](#service-interfaces)
  - [AppConfig (type alias)](#appconfig-type-alias)
- [Services](#services)
  - [AppConfigService (class)](#appconfigservice-class)

---

# Service Interfaces

## AppConfig (type alias)

Application runtime configuration values.

**Signature**

```ts
export type AppConfig = {
  readonly port: Port
  readonly logLevel: ConfiguredLogLevel
  readonly environment: Environment
}
```

Added in v1.0.0

# Services

## AppConfigService (class)

Tag for accessing application configuration values.

**Signature**

```ts
export declare class AppConfigService
```

Added in v1.0.0
