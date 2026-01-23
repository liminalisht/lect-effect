---
title: app/core/config/frontend-config.ts
nav_order: 12
parent: Modules
---

## frontend-config overview

Frontend configuration schemas and service tag.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Decoders](#decoders)
  - [decodeFrontendConfigEither](#decodefrontendconfigeither)
- [Schemas](#schemas)
  - [LogLevelNameSchema](#loglevelnameschema)
  - [RawFrontendConfigSchema](#rawfrontendconfigschema)
- [Service Interfaces](#service-interfaces)
  - [FrontendConfig (type alias)](#frontendconfig-type-alias)
- [Services](#services)
  - [FrontendConfigService (class)](#frontendconfigservice-class)
- [Types](#types)
  - [LogLevelName (type alias)](#loglevelname-type-alias)
  - [RawFrontendConfig (type alias)](#rawfrontendconfig-type-alias)

---

# Decoders

## decodeFrontendConfigEither

Decode and map a raw config object into the runtime frontend config.

**Signature**

```ts
export declare const decodeFrontendConfigEither: (raw: unknown) => Either.Either<FrontendConfig, ParseError>
```

Added in v1.0.0

# Schemas

## LogLevelNameSchema

Log level identifiers accepted from raw config.

**Signature**

```ts
export declare const LogLevelNameSchema: Schema.Literal<
  ["All", "Fatal", "Error", "Warning", "Info", "Debug", "Trace", "None"]
>
```

Added in v1.0.0

## RawFrontendConfigSchema

Schema for the raw frontend configuration provided by Angular DI.

**Signature**

```ts
export declare const RawFrontendConfigSchema: Schema.Struct<{
  graphqlEndpoint: typeof Schema.String
  logLevel: Schema.Literal<["All", "Fatal", "Error", "Warning", "Info", "Debug", "Trace", "None"]>
}>
```

Added in v1.0.0

# Service Interfaces

## FrontendConfig (type alias)

Decoded frontend configuration used by the Effect runtime.

**Signature**

```ts
export type FrontendConfig = Readonly<{
  graphqlEndpoint: string
  logLevel: LogLevel.LogLevel
}>
```

Added in v1.0.0

# Services

## FrontendConfigService (class)

Tag for locating the decoded frontend configuration in an Effect environment.

**Signature**

```ts
export declare class FrontendConfigService
```

Added in v1.0.0

# Types

## LogLevelName (type alias)

Parsed log level literal type.

**Signature**

```ts
export type LogLevelName = Schema.Schema.Type<typeof LogLevelNameSchema>
```

Added in v1.0.0

## RawFrontendConfig (type alias)

Raw config shape prior to decoding.

**Signature**

```ts
export type RawFrontendConfig = Schema.Schema.Type<typeof RawFrontendConfigSchema>
```

Added in v1.0.0
