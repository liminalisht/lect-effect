---
title: errors.ts
nav_order: 20
parent: Modules
---

## errors overview

Application error union definitions.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [AppError (type alias)](#apperror-type-alias)

---

# utils

## AppError (type alias)

Union type of all application-specific errors.

**Signature**

```ts
export type AppError = ConfigurationError | DomainError | GraphqlError | SqlError
```

Added in v1.0.0
