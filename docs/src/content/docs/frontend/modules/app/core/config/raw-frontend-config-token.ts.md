---
title: app/core/config/raw-frontend-config-token.ts
nav_order: 13
parent: Modules
---

## raw-frontend-config-token overview

Angular token for supplying the raw frontend configuration object.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [Injection Tokens](#injection-tokens)
  - [RAW_FRONTEND_CONFIG](#raw_frontend_config)

---

# Injection Tokens

## RAW_FRONTEND_CONFIG

Injection token bound to the raw (decoded later) frontend config.

**Signature**

```ts
export declare const RAW_FRONTEND_CONFIG: InjectionToken<{
  readonly graphqlEndpoint: string
  readonly logLevel: "All" | "Fatal" | "Error" | "Warning" | "Info" | "Debug" | "Trace" | "None"
}>
```

Added in v0.1.0
