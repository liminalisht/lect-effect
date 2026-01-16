---
title: services/appConfig/interface/index.ts
nav_order: 37
parent: Modules
---

## index overview

Application configuration module surface.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [AppConfig (type alias)](#appconfig-type-alias)
  - [AppConfigService (class)](#appconfigservice-class)

---

# utils

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

## AppConfigService (class)

Tag for accessing application configuration values.

**Signature**

```ts
export declare class AppConfigService
```

Added in v1.0.0
