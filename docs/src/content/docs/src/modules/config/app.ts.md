---
title: config/app.ts
nav_order: 2
parent: Modules
---

## app overview

Application configuration module surface.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [AppConfig (type alias)](#appconfig-type-alias)

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
