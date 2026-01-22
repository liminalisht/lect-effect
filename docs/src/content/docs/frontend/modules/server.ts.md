---
title: server.ts
nav_order: 23
parent: Modules
---

## server overview

Node server entrypoint for the Angular SSR app.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [reqHandler](#reqhandler)

---

# utils

## reqHandler

Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.

**Signature**

```ts
export declare const reqHandler: express.Express
```

Added in v1.0.0
