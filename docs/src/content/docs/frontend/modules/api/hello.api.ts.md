---
title: api/hello.api.ts
nav_order: 1
parent: Modules
---

## hello.api overview

Added in v1.0.0

Implementation requirements (these are the “laws”):

- Do not import Angular.
- Validate variables via shared schema `nameInputSchema`.
- Call GraphQL with `GraphQLClientTag.request(...)`.
- Validate the returned data via a schema.
- Return `HelloResponse` (not the whole GraphQL envelope).

Because `GraphQLClient.request` returns only the GraphQL data JSON (not `{ data, errors }`),
decode the shape `{ greet: HelloResponse }` and then project `.greet`. This matches the backend
test shape (`json.data.greet.greeting`).

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [HelloApiError (type alias)](#helloapierror-type-alias)
  - [greet](#greet)

---

# utils

## HelloApiError (type alias)

Errors possible from the hello API call.

**Signature**

```ts
export type HelloApiError = GraphQLClientError | ParseError
```

Added in v1.0.0

## greet

Calls the hello GraphQL resolver and returns a normalized greeting.

**Signature**

```ts
export declare const greet: (input: unknown) => Effect.Effect<HelloResponse, HelloApiError, GraphQLClient>
```

Added in v1.0.0
