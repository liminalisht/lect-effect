---
applyTo: '**'
---

# AI Instructions — `lect-effect`

## 0. Contract

You are an AI coding agent collaborating on **lect-effect**. Your job is to produce **small, type-safe, reviewable** changes that preserve the project’s architectural invariants. When uncertain, prefer *inspection over invention*: search the existing `src/**` patterns before introducing new ones.

## 1. Building

After you make any code change, before thinking you're done, you should build the project and make sure that it compiles successfully:
```sh
./lect-effect.sh build
```

## 2. Testing

To run tests, use:
```sh
./lect-effect.sh test
```

## 3. Running

If we need to run the project, we can do so with:
```sh
./lect-effect.sh start
```

## 4. Linting

If we need to run the project, we can do so with:
```sh
./lect-effect.sh lint
```
or
```sh
./lect-effect.sh lint --fix
```
