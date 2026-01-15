---
title: services/config.ts
nav_order: 40
parent: Modules
---

## config overview

Configuration service tag and shape.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ConfigService (class)](#configservice-class)
  - [ConfigServiceShape (type alias)](#configserviceshape-type-alias)

---

# utils

## ConfigService (class)

Service tag for application configuration.

**Signature**

```ts
export declare class ConfigService
```

Added in v1.0.0

## ConfigServiceShape (type alias)

Shape of configuration values provided by ConfigService.

**Signature**

```ts
export type ConfigServiceShape = {
  readonly app: AppConfig
  readonly masterdataPg: MasterdataDbConfig
}
```

Added in v1.0.0
