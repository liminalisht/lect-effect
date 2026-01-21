---
title: services/appConfig/interface/environment.ts
nav_order: 18
parent: Modules
---

## environment overview

Deployment environment configuration bindings.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Environment (type alias)](#environment-type-alias)
  - [environmentSchema](#environmentschema)

---

# utils

## Environment (type alias)

Deployment environment discriminator.

**Signature**

```ts
export type Environment = Schema.Schema.Type<typeof environmentSchema>
```

Added in v1.0.0

## environmentSchema

Schema for allowed deployment environments.

**Signature**

```ts
export declare const environmentSchema: Schema.Literal<["dev", "test", "staging", "prod"]>
```

Added in v1.0.0
