---
title: hello/greeting.ts
nav_order: 2
parent: Modules
---

## greeting overview

Hello domain greeting message definitions.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Domain Schemas](#domain-schemas)
  - [greetingSchema](#greetingschema)
- [Domain Types](#domain-types)
  - [Greeting (type alias)](#greeting-type-alias)

---

# Domain Schemas

## greetingSchema

Schema for greeting messages.

**Signature**

```ts
export declare const greetingSchema: Schema.brand<typeof Schema.String, "Greeting">
```

Added in v0.1.0

# Domain Types

## Greeting (type alias)

Greeting message value object.

**Signature**

```ts
export type Greeting = Schema.Schema.Type<typeof greetingSchema>
```

Added in v0.1.0
