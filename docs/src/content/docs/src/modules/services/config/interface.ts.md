---
title: services/config/interface.ts
nav_order: 23
parent: Modules
---

## interface overview

Configuration service tag and shape.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Config (type alias)](#config-type-alias)
  - [ConfigService (class)](#configservice-class)

---

# utils

## Config (type alias)

Shape of configuration values provided by ConfigService.

**Signature**

```ts
export type Config = {
  readonly app: AppConfig
  readonly masterdataPg: MasterdataDbConfig
}
```

Added in v1.0.0

## ConfigService (class)

Service tag for application configuration.

**Signature**

```ts
export declare class ConfigService
```

Added in v1.0.0
