---
title: appConfig/interface/environment.ts
nav_order: 4
parent: Modules
---

## environment overview

Deployment environment configuration bindings.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Schemas](#schemas)
  - [environmentSchema](#environmentschema)
- [Types](#types)
  - [Environment (type alias)](#environment-type-alias)

---

# Schemas

## environmentSchema

Schema for allowed deployment environments.

**Signature**

```ts
export declare const environmentSchema: Schema.Literal<["dev", "test", "staging", "prod"]>
```

Added in v0.1.0

# Types

## Environment (type alias)

Deployment environment discriminator.

**Signature**

```ts
export type Environment = Schema.Schema.Type<typeof environmentSchema>
```

Added in v0.1.0
