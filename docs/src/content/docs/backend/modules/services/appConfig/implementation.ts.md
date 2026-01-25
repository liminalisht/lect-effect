---
title: services/appConfig/implementation.ts
nav_order: 12
parent: Modules
---

## implementation overview

Layer for loading and providing application configuration.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Service Implementations](#service-implementations)
  - [appConfigServiceImplementation](#appconfigserviceimplementation)

---

# Service Implementations

## appConfigServiceImplementation

Loads application configuration from environment variables.

**Signature**

```ts
export declare const appConfigServiceImplementation: Effect.Effect<AppConfig, ConfigError.ConfigError, never>
```

Added in v1.0.0
