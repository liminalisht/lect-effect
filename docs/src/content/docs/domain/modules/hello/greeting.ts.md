---
title: hello/greeting.ts
nav_order: 2
parent: Modules
---

## greeting overview

Hello domain greeting message definitions.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Greeting (type alias)](#greeting-type-alias)
  - [greetingSchema](#greetingschema)

---

# utils

## Greeting (type alias)

Greeting message value object.

**Signature**

```ts
export type Greeting = Schema.Schema.Type<typeof greetingSchema>
```

Added in v1.0.0

## greetingSchema

Schema for greeting messages.

**Signature**

```ts
export declare const greetingSchema: Schema.brand<typeof Schema.String, "Greeting">
```

Added in v1.0.0
