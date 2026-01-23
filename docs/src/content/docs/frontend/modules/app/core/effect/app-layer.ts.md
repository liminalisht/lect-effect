---
title: app/core/effect/app-layer.ts
nav_order: 14
parent: Modules
---

## app-layer overview

Application Effect layer composition for the frontend runtime.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [AppEnv (type alias)](#appenv-type-alias)
  - [makeAppLayer](#makeapplayer)

---

# utils

## AppEnv (type alias)

Union of services required by the UI Effect runtime.

**Signature**

```ts
export type AppEnv = FrontendConfigService | GraphQLClientService | HelloApiService | ProductApiService
```

Added in v1.0.0

## makeAppLayer

Build the composed application layer used by UiRuntime.

**Signature**

```ts
export declare const makeAppLayer: (cfg: FrontendConfig) => Layer.Layer<AppEnv>
```

Added in v1.0.0
