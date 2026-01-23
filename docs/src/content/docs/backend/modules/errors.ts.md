---
title: errors.ts
nav_order: 2
parent: Modules
---

## errors overview

Application error union definitions.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Application Errors](#application-errors)
  - [AppError (type alias)](#apperror-type-alias)

---

# Application Errors

## AppError (type alias)

Union type of all application-specific errors.

**Signature**

```ts
export type AppError = ConfigurationError | DomainError | GraphqlError | SqlError
```

Added in v1.0.0
