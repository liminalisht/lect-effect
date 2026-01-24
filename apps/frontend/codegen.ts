import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'node_modules/@lect-effect/graphql-schema/schema.graphql',
  documents: ['src/graphql/**/*.graphql'],
  generates: {
    'src/graphql/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typed-document-node',
      ],
      config: {
        avoidOptionals: true,
        maybeValue: 'T | null',
      },
    },
  },
};

export default config;
