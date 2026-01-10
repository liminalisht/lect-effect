```sh
pnpm init
volta pin node@24
pnpm add typescript
pnpm add --save-dev @tsconfig/node24
pnpm add --save-dev @types/node
pnpm add graphql @gqloom/core effect @gqloom/effect
pnpm add graphql-yoga
pnpm install xo --save-dev
pnpm add -D @effect/language-service
pnpm add dotenv
pnpm add @effect/platform-node
pnpm add -D vitest @effect/vitest fast-check @types/node
pnpm add @effect/sql @effect/sql-pg
```

`.editorconfig`:
```
root = true

[*]
indent_style = space
indent_size = 2
tab_width = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

`.tsconfig`:
```
{
  "extends": "@tsconfig/node24/tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "lib": ["esnext"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src", "tests"],
  "exclude": ["node_modules"]
}
```

`tsconfig.json`:
```json
{
  "name": "lect-effect",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "start": "pnpm run build && node dist/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "packageManager": "pnpm@10.22.0",
  "volta": {
    "node": "24.12.0"
  },
  "dependencies": {
    "@gqloom/core": "^0.15.0",
    "@gqloom/effect": "^0.13.0",
    "effect": "^3.19.14",
    "graphql": "^16.12.0",
    "graphql-yoga": "^5.18.0",
    "typescript": "^5.9.3"
  },
  "devDependencies": {
    "@tsconfig/node24": "^24.0.3",
    "@types/node": "^25.0.3"
  }
}
```

`build.sh` and `run.sh` scripts
