---
title: app/core/effect/app-layer.ts
nav_order: 14
parent: Modules
---

## app-layer overview

Application Effect layer composition for the frontend runtime.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Application Layers](#application-layers)
  - [makeAppLayer](#makeapplayer)
- [Application Services](#application-services)
  - [AppEnv (type alias)](#appenv-type-alias)

---

# Application Layers

## makeAppLayer

Build the composed application layer used by UiRuntime.

**Signature**

```ts
export declare const makeAppLayer: (cfg: FrontendConfig) => Layer.Layer<AppEnv>
```

Added in v0.1.0

# Application Services

## AppEnv (type alias)

Union of services required by the UI Effect runtime.

**Signature**

```ts
export type AppEnv = FrontendConfigService | GraphQLClientService | HelloApiService | ProductApiService
```

Added in v0.1.0
