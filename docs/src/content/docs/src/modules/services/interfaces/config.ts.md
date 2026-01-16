---
title: services/interfaces/config.ts
nav_order: 43
parent: Modules
---

## config overview

Configuration service tag and shape.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ConfigService (class)](#configservice-class)
  - [ConfigService (type alias)](#ConfigService-type-alias)

---

# utils

## ConfigService (class)

Service tag for application configuration.

**Signature**

```ts
export declare class ConfigService
```

Added in v1.0.0

## ConfigService (type alias)

Shape of configuration values provided by ConfigService.

**Signature**

```ts
export type ConfigService = {
  readonly app: AppConfig
  readonly masterdataPg: MasterdataDbConfig
}
```

Added in v1.0.0
