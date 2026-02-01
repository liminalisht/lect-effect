---
title: app/core/json/json.ts
nav_order: 20
parent: Modules
---

## json overview

Minimal JSON value shape for GraphQL responses.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Types](#types)
  - [Json (type alias)](#json-type-alias)

---

# Types

## Json (type alias)

Minimal JSON value shape for GraphQL responses.

**Signature**

```ts
export type Json = null | boolean | number | string | readonly Json[] | { [key: string]: Json }
```

Added in v0.1.0
